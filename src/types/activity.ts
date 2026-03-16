export interface AgentStatus {
  id: string
  name: string
  role: string
  status: "working" | "idle" | "error" | "offline"
  currentTask?: string
  location: "desk" | "breakroom" | "conference"
  lastActive: string
}

export interface ActivityEvent {
  id: string
  timestamp: string
  agent: string
  type: "start" | "complete" | "error" | "info"
  message: string
  durationMs?: number
}

export interface TeamOverviewResponse {
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

export type AgentId = "main" | "builder" | "content" | "atlas"

export type FilterMode = "ALL" | "WORKING" | "IDLE"

export const STATUS_COLORS: Record<string, string> = {
  working: "bg-green-500",
  idle: "bg-yellow-500",
  error: "bg-red-500",
  offline: "bg-gray-500",
}
