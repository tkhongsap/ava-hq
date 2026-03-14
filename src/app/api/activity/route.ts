import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const AGENTS_DIR = "/data/.openclaw/agents"
const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

interface AgentStatus {
  id: string
  name: string
  role: string
  status: "working" | "idle" | "error" | "offline"
  currentTask?: string
  location: "desk" | "breakroom" | "conference"
  lastActive: string
}

interface ActivityEvent {
  id: string
  timestamp: string
  agent: string
  type: "start" | "complete" | "error" | "info"
  message: string
  durationMs?: number
}

interface TeamOverviewResponse {
  agents: AgentStatus[]
  events: ActivityEvent[]
  stats: {
    completed: number
    running: number
    failed: number
    avgDurationMs: number
  }
  serverTime: string
}

const AGENT_MAP: Record<string, { name: string; role: string }> = {
  main: { name: "Ava", role: "Orchestrator" },
  builder: { name: "Builder", role: "Engineer" },
  content: { name: "Content", role: "Creator" },
  atlas: { name: "Atlas", role: "Analyst" },
}

function getFirstUserMessage(lines: string[]): string | null {
  for (const line of lines) {
    try {
      const obj = JSON.parse(line)
      if (
        obj.type === "message" &&
        obj.message?.role === "user" &&
        Array.isArray(obj.message?.content)
      ) {
        const textBlock = obj.message.content.find(
          (b: { type: string; text?: string }) => b.type === "text" && b.text
        )
        if (textBlock?.text) {
          return textBlock.text.slice(0, 200)
        }
      }
    } catch {
      // skip malformed lines
    }
  }
  return null
}

function getSessionTimestamp(lines: string[]): string | null {
  if (lines.length === 0) return null
  try {
    const first = JSON.parse(lines[0])
    return first.timestamp || null
  } catch {
    return null
  }
}

interface SessionInfo {
  agentId: string
  sessionId: string
  startTime: string
  mtime: Date
  task: string
  isActive: boolean
  hasError: boolean
}

function scanSessions(hoursBack: number): SessionInfo[] {
  const sessions: SessionInfo[] = []
  const cutoff = Date.now() - hoursBack * 60 * 60 * 1000

  let agentDirs: string[] = []
  try {
    agentDirs = fs.readdirSync(AGENTS_DIR)
  } catch {
    return sessions
  }

  for (const agentId of agentDirs) {
    if (!AGENT_MAP[agentId]) continue

    const sessionsDir = path.join(AGENTS_DIR, agentId, "sessions")
    let files: string[] = []
    try {
      files = fs.readdirSync(sessionsDir).filter((f) => f.endsWith(".jsonl"))
    } catch {
      continue
    }

    for (const file of files) {
      const filePath = path.join(sessionsDir, file)
      let stat: fs.Stats
      try {
        stat = fs.statSync(filePath)
      } catch {
        continue
      }

      if (stat.mtime.getTime() < cutoff) continue

      let lines: string[]
      try {
        const content = fs.readFileSync(filePath, "utf-8")
        lines = content.split("\n").filter((l) => l.trim())
      } catch {
        continue
      }

      const startTime = getSessionTimestamp(lines) || stat.mtime.toISOString()
      const task = getFirstUserMessage(lines) || "Session activity"
      const isActive = Date.now() - stat.mtime.getTime() < ACTIVE_THRESHOLD_MS

      // Check for errors in last few messages
      let hasError = false
      const lastLines = lines.slice(-10)
      for (const line of lastLines) {
        try {
          const obj = JSON.parse(line)
          if (obj.type === "error" || obj.type === "tool_error") {
            hasError = true
          }
        } catch {
          // skip
        }
      }

      sessions.push({
        agentId,
        sessionId: file.replace(".jsonl", ""),
        startTime,
        mtime: stat.mtime,
        task,
        isActive,
        hasError,
      })
    }
  }

  sessions.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
  return sessions
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const hours = parseInt(searchParams.get("hours") || "76", 10)

  const sessions = scanSessions(hours)

  // Build agent statuses
  const agentStatuses: AgentStatus[] = Object.entries(AGENT_MAP).map(
    ([id, meta]) => {
      const agentSessions = sessions.filter((s) => s.agentId === id)
      const activeSessions = agentSessions.filter((s) => s.isActive)
      const latestSession = agentSessions[0]

      let status: AgentStatus["status"] = "idle"
      let currentTask: string | undefined

      if (activeSessions.length > 0) {
        status = activeSessions.some((s) => s.hasError) ? "error" : "working"
        currentTask = activeSessions[0].task
      } else if (agentSessions.length === 0) {
        status = "offline"
      }

      return {
        id,
        name: meta.name,
        role: meta.role,
        status,
        currentTask,
        location: status === "working" || status === "error" ? "desk" : "breakroom",
        lastActive: latestSession?.mtime.toISOString() || new Date().toISOString(),
      }
    }
  )

  // Build events from sessions
  const events: ActivityEvent[] = sessions.slice(0, 50).map((s) => {
    const type: ActivityEvent["type"] = s.hasError
      ? "error"
      : s.isActive
        ? "start"
        : "complete"

    return {
      id: s.sessionId,
      timestamp: s.mtime.toISOString(),
      agent: s.agentId,
      type,
      message: s.task.slice(0, 100),
      durationMs: s.isActive
        ? Date.now() - new Date(s.startTime).getTime()
        : s.mtime.getTime() - new Date(s.startTime).getTime(),
    }
  })

  // Stats
  const completed = sessions.filter((s) => !s.isActive && !s.hasError).length
  const running = sessions.filter((s) => s.isActive).length
  const failed = sessions.filter((s) => s.hasError).length
  const durations = sessions
    .filter((s) => !s.isActive)
    .map((s) => s.mtime.getTime() - new Date(s.startTime).getTime())
    .filter((d) => d > 0)
  const avgDurationMs =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0

  const response: TeamOverviewResponse = {
    agents: agentStatuses,
    events: events.slice(0, 20),
    stats: { completed, running, failed, avgDurationMs },
    serverTime: new Date().toISOString(),
  }

  return NextResponse.json(response)
}
