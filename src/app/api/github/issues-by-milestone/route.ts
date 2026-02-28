import { NextRequest, NextResponse } from "next/server"
import { githubFetch, getRepos } from "@/lib/github"

interface Issue {
  number: number
  title: string
  state: string
  labels: { name: string; color: string }[]
  html_url: string
  milestone: { title: string } | null
  repository_url: string
}

export async function GET(request: NextRequest) {
  try {
    const repo = request.nextUrl.searchParams.get("repo")
    const repos = repo ? [repo] : getRepos()

    const milestoneMap: Record<string, {
      title: string
      issues: { number: number; title: string; state: string; labels: { name: string; color: string }[]; url: string; repo: string }[]
      open: number
      closed: number
    }> = {}

    for (const r of repos) {
      const issues: Issue[] = await githubFetch(`/repos/${r}/issues?state=all&per_page=100`)
      for (const issue of issues) {
        if ("pull_request" in issue) continue
        const ms = issue.milestone?.title || "No Milestone"
        if (!milestoneMap[ms]) {
          milestoneMap[ms] = { title: ms, issues: [], open: 0, closed: 0 }
        }
        milestoneMap[ms].issues.push({
          number: issue.number,
          title: issue.title,
          state: issue.state,
          labels: issue.labels,
          url: issue.html_url,
          repo: r,
        })
        if (issue.state === "open") milestoneMap[ms].open++
        else milestoneMap[ms].closed++
      }
    }

    return NextResponse.json(Object.values(milestoneMap))
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
