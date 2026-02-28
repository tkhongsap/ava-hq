import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import crypto from "crypto"

const SECRET = new TextEncoder().encode(
  process.env.AUTH_PASSWORD_HASH || "dev-secret-change-me"
)

export async function hashPassword(password: string): Promise<string> {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.AUTH_PASSWORD_HASH
  if (!hash) return false
  const inputHash = await hashPassword(password)
  return inputHash === hash
}

export async function createSession(): Promise<string> {
  const token = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(SECRET)
  return token
}

export async function verifySession(): Promise<boolean> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("session")?.value
    if (!token) return false
    await jwtVerify(token, SECRET)
    return true
  } catch {
    return false
  }
}
