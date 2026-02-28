"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw } from "lucide-react"

interface Check {
  name: string
  status: "green" | "yellow" | "red"
  message: string
  checkedAt: string
}

interface HealthData {
  status: string
  checks: Check[]
}

const statusColors = {
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
}

export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchHealth = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/health")
      const d = await res.json()
      setData(d)
    } catch {
      setData({ status: "error", checks: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHealth()
  }, [fetchHealth])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">System Health</h2>
        <Button variant="outline" size="sm" onClick={fetchHealth} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {data === null ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base capitalize">{data.status}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.checks.map((check) => (
                <div key={check.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${statusColors[check.status]}`} />
                    <div>
                      <p className="text-sm font-medium">{check.name}</p>
                      <p className="text-xs text-muted-foreground">{check.message}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(check.checkedAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
