import { NextRequest, NextResponse } from "next/server"
import { verifyPassword, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { password } = body

  if (!password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 })
  }

  const valid = await verifyPassword(password)
  if (!valid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  }

  const token = await createSession()
  const response = NextResponse.json({ success: true })
  response.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete("session")
  return response
}
