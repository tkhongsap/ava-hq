import { SignJWT } from "jose"
import crypto from "crypto"

let cachedToken: { token: string; expiresAt: number } | null = null

export async function getInstallationToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token
  }

  const appId = process.env.GITHUB_APP_ID
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY

  if (!appId || !installationId || !privateKey) {
    throw new Error("GitHub App credentials not configured")
  }

  // Create JWT
  const key = crypto.createPrivateKey(privateKey.replace(/\\n/g, "\n"))
  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(appId)
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(key)

  // Exchange for installation token
  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github+json",
      },
    }
  )

  if (!res.ok) {
    throw new Error(`GitHub token exchange failed: ${res.status}`)
  }

  const data = await res.json()
  cachedToken = {
    token: data.token,
    expiresAt: new Date(data.expires_at).getTime(),
  }
  return data.token
}

export async function githubFetch(path: string) {
  const token = await getInstallationToken()
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  return res.json()
}

export function getRepos(): string[] {
  return (process.env.GITHUB_REPOS || "").split(",").filter(Boolean)
}
