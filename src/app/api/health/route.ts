import { NextResponse } from "next/server"

interface Check {
  name: string
  status: "green" | "yellow" | "red"
  message: string
  checkedAt: string
}

async function checkUrl(name: string, url: string): Promise<Check> {
  const checkedAt = new Date().toISOString()
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(url, { signal: controller.signal, method: "HEAD" })
    clearTimeout(timeout)
    return {
      name,
      status: res.ok ? "green" : "yellow",
      message: res.ok ? "Reachable" : `Status ${res.status}`,
      checkedAt,
    }
  } catch {
    return { name, status: "red", message: "Unreachable", checkedAt }
  }
}

async function checkDns(hostname: string): Promise<Check> {
  const checkedAt = new Date().toISOString()
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    await fetch(`https://${hostname}`, { signal: controller.signal, method: "HEAD" })
    clearTimeout(timeout)
    return { name: `DNS: ${hostname}`, status: "green", message: "Resolves", checkedAt }
  } catch (err) {
    const message = err instanceof Error && err.name === "AbortError" ? "Timeout" : "Failed"
    return { name: `DNS: ${hostname}`, status: message === "Timeout" ? "yellow" : "red", message, checkedAt }
  }
}

export async function GET() {
  const postizUrl = process.env.POSTIZ_API_URL || "https://api.postiz.com"

  const checks = await Promise.all([
    checkUrl("Postiz API", postizUrl),
    checkUrl("GitHub API", "https://api.github.com"),
    checkDns("hq.tkhongsap.io"),
  ])

  const overall = checks.every((c) => c.status === "green")
    ? "healthy"
    : checks.some((c) => c.status === "red")
      ? "unhealthy"
      : "degraded"

  return NextResponse.json({ status: overall, checks })
}
