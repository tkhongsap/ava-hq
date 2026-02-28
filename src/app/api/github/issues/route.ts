import { NextResponse } from "next/server"
import { githubFetch, getRepos } from "@/lib/github"

export async function GET() {
  try {
    const repos = getRepos()
    let totalOpen = 0

    for (const repo of repos) {
      const data = await githubFetch(`/repos/${repo}`)
      totalOpen += data.open_issues_count || 0
    }

    return NextResponse.json({ count: totalOpen })
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch issues", count: 0 },
      { status: 500 }
    )
  }
}
