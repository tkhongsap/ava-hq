"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Brain, Hammer, PenTool, FileSearch } from "lucide-react"

interface Agent {
  name: string
  role: string
  description: string
  model: string
  status: string
  icon: string
}

const iconMap: Record<string, React.ElementType> = {
  brain: Brain,
  hammer: Hammer,
  "pen-tool": PenTool,
  "file-search": FileSearch,
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[] | null>(null)

  useEffect(() => {
    fetch("/agents.json")
      .then((r) => r.json())
      .then(setAgents)
  }, [])

  if (!agents) {
    return (
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-6">Agents</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-6">Agents</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {agents.map((agent) => {
          const Icon = iconMap[agent.icon] || Brain
          return (
            <Card key={agent.name}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="p-2 rounded-md bg-accent">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{agent.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{agent.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      agent.status === "active" ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                  <span className="text-xs text-muted-foreground capitalize">{agent.status}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{agent.description}</p>
                <p className="text-xs text-muted-foreground mt-2 font-mono">{agent.model}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
