"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink, GitCommit } from "lucide-react"

interface Commit {
  sha: string
  message: string
  author: string
  repo: string
  date: string
  url: string
}

interface Issue {
  number: number
  title: string
  state: string
  labels: { name: string; color: string }[]
  url: string
  repo: string
}

interface Milestone {
  title: string
  issues: Issue[]
  open: number
  closed: number
}

export default function IssuesPage() {
  const [milestones, setMilestones] = useState<Milestone[] | null>(null)
  const [commits, setCommits] = useState<Commit[] | null>(null)
  const [error, setError] = useState(false)

  const fetchCommits = useCallback(() => {
    fetch("/api/github/commits")
      .then((r) => r.json())
      .then(setCommits)
      .catch(() => setCommits([]))
  }, [])

  useEffect(() => {
    fetch("/api/github/issues-by-milestone")
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setMilestones)
      .catch(() => {
        setError(true)
        setMilestones([])
      })

    fetchCommits()
    const interval = setInterval(fetchCommits, 60000)
    return () => clearInterval(interval)
  }, [fetchCommits])

  if (milestones === null) {
    return (
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-6">Issues</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-6">Issues</h2>
      {error && <p className="text-sm text-red-500 mb-4">Failed to fetch from GitHub API</p>}
      {milestones.length === 0 && !error && (
        <p className="text-muted-foreground">No issues found.</p>
      )}
      <div className="space-y-6">
        {milestones.map((ms) => {
          const total = ms.open + ms.closed
          const pct = total > 0 ? Math.round((ms.closed / total) * 100) : 0
          return (
            <Card key={ms.title}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{ms.title}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {ms.closed}/{total} closed
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ms.issues.map((issue) => (
                    <div
                      key={`${issue.repo}-${issue.number}`}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div
                        className={`h-2 w-2 rounded-full flex-shrink-0 ${
                          issue.state === "open" ? "bg-green-500" : "bg-purple-500"
                        }`}
                      />
                      <a
                        href={issue.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex-1 flex items-center gap-1"
                      >
                        <span className="text-muted-foreground">#{issue.number}</span>
                        <span>{issue.title}</span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground ml-1" />
                      </a>
                      <div className="flex gap-1">
                        {issue.labels.map((l) => (
                          <span
                            key={l.name}
                            className="px-1.5 py-0.5 text-xs rounded-full"
                            style={{
                              backgroundColor: `#${l.color}20`,
                              color: `#${l.color}`,
                            }}
                          >
                            {l.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Commits */}
      <h3 className="text-xl font-bold tracking-tight mt-8 mb-4">Recent Commits</h3>
      {commits === null ? (
        <Skeleton className="h-48" />
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {commits.map((c) => (
                <div key={`${c.repo}-${c.sha}`} className="flex items-start gap-3 text-sm">
                  <GitCommit className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline font-medium truncate block"
                    >
                      {c.message}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {c.author} · {c.repo} · {c.sha} · {new Date(c.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {commits.length === 0 && (
                <p className="text-muted-foreground text-sm">No commits found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
