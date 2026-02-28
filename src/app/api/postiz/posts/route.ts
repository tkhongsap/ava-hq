import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiUrl = process.env.POSTIZ_API_URL || "https://api.postiz.com"
    const apiKey = process.env.POSTIZ_API_KEY

    if (!apiKey) {
      return NextResponse.json({ posts: [] })
    }

    const res = await fetch(`${apiUrl}/posts`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      return NextResponse.json({ posts: [] }, { status: 500 })
    }

    const data = await res.json()
    const posts = Array.isArray(data) ? data : data.data || []

    return NextResponse.json({ posts })
  } catch {
    return NextResponse.json({ posts: [] }, { status: 500 })
  }
}
