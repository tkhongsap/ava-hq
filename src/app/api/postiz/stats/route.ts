import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiUrl = process.env.POSTIZ_API_URL || "https://api.postiz.com"
    const apiKey = process.env.POSTIZ_API_KEY

    if (!apiKey) {
      return NextResponse.json({ drafts: 0, published: 0 })
    }

    const res = await fetch(`${apiUrl}/posts`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      return NextResponse.json({ drafts: 0, published: 0 }, { status: 500 })
    }

    const posts = await res.json()
    const arr = Array.isArray(posts) ? posts : posts.data || []
    const drafts = arr.filter((p: { status: string }) => p.status === "draft").length
    const published = arr.filter((p: { status: string }) => p.status === "published").length

    return NextResponse.json({ drafts, published })
  } catch {
    return NextResponse.json({ drafts: 0, published: 0 }, { status: 500 })
  }
}
