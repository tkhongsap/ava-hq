"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Press_Start_2P } from "next/font/google"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw } from "lucide-react"
import { PixelAvatar } from "@/components/pixel-avatar"
import { ActivityTicker } from "@/components/activity-ticker"
import type { AgentStatus, TeamOverviewResponse, AgentId, FilterMode } from "@/types/activity"
import { STATUS_COLORS } from "@/types/activity"

const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"] })

const roomColors: Record<string, string> = {
  main: "bg-orange-950/30",
  builder: "bg-blue-950/30",
  content: "bg-purple-950/30",
  atlas: "bg-green-950/30",
}

const roomHeaderColors: Record<string, string> = {
  main: "bg-orange-900/60",
  builder: "bg-blue-900/60",
  content: "bg-purple-900/60",
  atlas: "bg-green-900/60",
}

const deskItems: Record<string, string> = {
  main: "🖥🖥🖥 ☕ 📋",
  builder: "💻 ⌨️ 🥤 ⚙️",
  content: "📱 📝 🎨 ✏️",
  atlas: "📊 🌐 📈 🔍",
}


function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

function LiveClock() {
  const [time, setTime] = useState("")

  useEffect(() => {
    function tick() {
      const now = new Date()
      setTime(now.toLocaleTimeString("en-GB", { hour12: false }))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  return <span className="font-mono text-sm text-muted-foreground">{time}</span>
}

function SpeechBubble({ text }: { text: string }) {
  return (
    <div className="relative bg-card border border-border rounded px-2 py-1 mt-2 text-[10px] text-muted-foreground max-w-[180px]">
      <div className="absolute -top-1.5 left-4 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-border" />
      <div className="absolute -top-1 left-4 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-card" />
      {text.slice(0, 50)}
    </div>
  )
}

function AgentRoom({ agent, pixelFontClass }: { agent: AgentStatus; pixelFontClass: string }) {
  const isWorking = agent.status === "working"
  const isError = agent.status === "error"
  return (
    <Card
      className={`overflow-hidden ${roomColors[agent.id] || ""} ${
        isError ? "animate-pulse border-red-500/50" : ""
      }`}
    >
      {/* Room header */}
      <div
        className={`px-3 py-2 flex items-center gap-2 ${roomHeaderColors[agent.id] || ""}`}
      >
        <div
          className={`h-2 w-2 rounded-full shrink-0 ${STATUS_COLORS[agent.status]}`}
        />
        <span className={`${pixelFontClass} text-[8px] uppercase`}>
          {agent.name}
        </span>
        <span
          className={`${pixelFontClass} text-[6px] px-1 py-0.5 rounded bg-muted/50 text-muted-foreground`}
        >
          {agent.role}
        </span>
      </div>

      {/* Room body */}
      <div className="p-4 flex flex-col items-center min-h-[140px] justify-center">
        {isWorking || isError ? (
          <>
            <PixelAvatar
              agent={agent.id as AgentId}
              status={agent.status}
              size={64}
            />
            {agent.currentTask && <SpeechBubble text={agent.currentTask} />}
          </>
        ) : (
          <div className="text-2xl">🪑</div>
        )}
        <div className="mt-3 text-sm tracking-wider">{deskItems[agent.id]}</div>
      </div>
    </Card>
  )
}

function BreakRoom({
  idleAgents,
  pixelFontClass,
}: {
  idleAgents: AgentStatus[]
  pixelFontClass: string
}) {
  return (
    <Card className="overflow-hidden bg-amber-950/20">
      <div className="px-3 py-2 bg-amber-900/40">
        <span className={`${pixelFontClass} text-[8px] uppercase`}>
          Break Room
        </span>
        <span className="ml-3 text-sm">☕🍕🛋</span>
      </div>
      <div className="p-4 flex items-center gap-6 min-h-[80px] flex-wrap">
        {idleAgents.length === 0 ? (
          <p className="text-xs text-muted-foreground">Everyone&apos;s at work!</p>
        ) : (
          idleAgents.map((agent) => (
            <div key={agent.id} className="flex flex-col items-center gap-1">
              <PixelAvatar
                agent={agent.id as AgentId}
                status="idle"
                size={48}
              />
              <span className={`${pixelFontClass} text-[6px] text-muted-foreground`}>
                {agent.name}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

function ConferenceRoom({ pixelFontClass }: { pixelFontClass: string }) {
  return (
    <Card className="overflow-hidden bg-zinc-900/30">
      <div className="px-3 py-2 bg-zinc-800/40">
        <span className={`${pixelFontClass} text-[8px] uppercase`}>
          Conference Room
        </span>
        <span className="ml-3 text-sm">🪑🪑🪑</span>
      </div>
      <div className="p-4 min-h-[60px] flex items-center justify-center">
        <p className="text-xs text-muted-foreground">
          (No active collaborations)
        </p>
      </div>
    </Card>
  )
}

function OfficeFloor({
  agents,
  pixelFontClass,
}: {
  agents: AgentStatus[]
  pixelFontClass: string
}) {
  const idleAgents = agents.filter(
    (a) => a.status === "idle" || a.status === "offline"
  )

  return (
    <div className="space-y-3">
      {/* Agent rooms - 2x2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {agents.map((agent) => (
          <AgentRoom
            key={agent.id}
            agent={agent}
            pixelFontClass={pixelFontClass}
          />
        ))}
      </div>

      {/* Break Room */}
      <BreakRoom idleAgents={idleAgents} pixelFontClass={pixelFontClass} />

      {/* Conference Room */}
      <ConferenceRoom pixelFontClass={pixelFontClass} />
    </div>
  )
}

export default function ActivityPage() {
  const [data, setData] = useState<TeamOverviewResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState<FilterMode>("ALL")
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch("/api/activity")
      if (!res.ok) throw new Error("fetch failed")
      const d = await res.json()
      setData(d)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(fetchData, 30000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchData])

  const filteredAgents = data?.agents.filter((a) => {
    if (filter === "WORKING") return a.status === "working"
    if (filter === "IDLE") return a.status === "idle" || a.status === "offline"
    return true
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Team Activity</h2>
        <div className="flex items-center gap-3">
          <LiveClock />
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && !data && (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-red-400">
              Failed to load team activity data. Please try again.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {!data && !error && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-64 space-y-3">
            <Skeleton className="h-8" />
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
            <Skeleton className="h-24" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-96" />
          </div>
        </div>
      )}

      {/* Main layout */}
      {data && (
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left panel - Team Status */}
          <div className="w-full md:w-64 shrink-0 space-y-3">
            {/* Filter toggles */}
            <div className="flex gap-1">
              {(["ALL", "WORKING", "IDLE"] as FilterMode[]).map((mode) => (
                <Button
                  key={mode}
                  variant={filter === mode ? "default" : "outline"}
                  size="sm"
                  className="text-xs px-2 py-1 h-7"
                  onClick={() => setFilter(mode)}
                >
                  {mode}
                </Button>
              ))}
            </div>

            {/* Agent list */}
            <div className="space-y-2">
              {filteredAgents?.map((agent) => (
                <Card key={agent.id} className="p-3">
                  <div className="flex items-start gap-2">
                    <div
                      className={`h-2.5 w-2.5 rounded-full mt-1 shrink-0 ${STATUS_COLORS[agent.status]}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold uppercase">
                          {agent.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {agent.role}
                        </span>
                      </div>
                      {agent.currentTask && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {agent.currentTask.slice(0, 40)}
                        </p>
                      )}
                      {agent.status === "working" && agent.lastActive && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                          {formatDuration(
                            Date.now() - new Date(agent.lastActive).getTime()
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Stats block */}
            <Card className="p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                Stats
              </p>
              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span>{data.stats.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Running</span>
                  <span>{data.stats.running}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Failed</span>
                  <span>{data.stats.failed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Duration</span>
                  <span>{formatDuration(data.stats.avgDurationMs)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right side - Office Floor */}
          <div className="flex-1">
            <OfficeFloor
              agents={data.agents}
              pixelFontClass={pixelFont.className}
            />
          </div>
        </div>
      )}

      {/* Activity Ticker */}
      {data && <ActivityTicker events={data.events} />}
    </div>
  )
}
