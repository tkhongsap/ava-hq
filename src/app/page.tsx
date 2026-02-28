"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Bot, CircleDot, FileText, Send } from "lucide-react"

interface Stats {
  agents: number
  issues: number | null
  drafts: number | null
  published: number | null
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    agents: 4,
    issues: null,
    drafts: null,
    published: null,
  })
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function fetchStats() {
      try {
        const issueRes = await fetch("/api/github/issues")
        if (issueRes.ok) {
          const data = await issueRes.json()
          setStats((s) => ({ ...s, issues: data.count }))
        } else {
          setErrors((e) => ({ ...e, issues: true }))
          setStats((s) => ({ ...s, issues: 0 }))
        }
      } catch {
        setErrors((e) => ({ ...e, issues: true }))
        setStats((s) => ({ ...s, issues: 0 }))
      }

      try {
        const postizRes = await fetch("/api/postiz/stats")
        if (postizRes.ok) {
          const data = await postizRes.json()
          setStats((s) => ({ ...s, drafts: data.drafts, published: data.published }))
        } else {
          setErrors((e) => ({ ...e, postiz: true }))
          setStats((s) => ({ ...s, drafts: 0, published: 0 }))
        }
      } catch {
        setErrors((e) => ({ ...e, postiz: true }))
        setStats((s) => ({ ...s, drafts: 0, published: 0 }))
      }
    }

    fetchStats()
  }, [])

  const cards = [
    { title: "Total Agents", value: stats.agents, icon: Bot, error: false },
    { title: "Active Issues", value: stats.issues, icon: CircleDot, error: errors.issues },
    { title: "Pending Drafts", value: stats.drafts, icon: FileText, error: errors.postiz },
    { title: "Published Posts", value: stats.published, icon: Send, error: errors.postiz },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-6">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {card.value === null ? (
                <Skeleton className="h-8 w-16" />
              ) : card.error ? (
                <div>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-red-500">API unreachable</p>
                </div>
              ) : (
                <div className="text-2xl font-bold">{card.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
