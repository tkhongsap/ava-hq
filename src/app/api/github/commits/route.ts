import { NextResponse } from "next/server"
import { githubFetch, getRepos } from "@/lib/github"

export async function GET() {
  try {
    const repos = getRepos()
    const allCommits: {
      sha: string
      message: string
      author: string
      repo: string
      date: string
      url: string
    }[] = []

    for (const repo of repos) {
      const commits = await githubFetch(`/repos/${repo}/commits?per_page=20`)
      for (const c of commits) {
        allCommits.push({
          sha: c.sha.substring(0, 7),
          message: c.commit.message.split("\n")[0],
          author: c.commit.author.name,
          repo,
          date: c.commit.author.date,
          url: c.html_url,
        })
      }
    }

    // Sort by date descending, take 20
    allCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return NextResponse.json(allCommits.slice(0, 20))
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
