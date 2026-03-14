"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw } from "lucide-react"

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

type FilterMode = "ALL" | "WORKING" | "IDLE"

const statusColors: Record<string, string> = {
  working: "bg-green-500",
  idle: "bg-yellow-500",
  error: "bg-red-500",
  offline: "bg-gray-500",
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
        <div className="flex gap-4">
          <div className="w-64 space-y-3">
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
                      className={`h-2.5 w-2.5 rounded-full mt-1 shrink-0 ${statusColors[agent.status]}`}
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

          {/* Right side - placeholder for office floor (US-004) */}
          <div className="flex-1">
            <Card className="p-6 min-h-[400px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Office floor plan loading...
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
