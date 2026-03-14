import { NextResponse } from "next/server"

// Auth temporarily disabled — allow all requests
export async function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
