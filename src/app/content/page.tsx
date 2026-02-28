"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Twitter, Linkedin, ExternalLink } from "lucide-react"

interface Post {
  id: string
  content: string
  status: string
  platform?: string
  scheduledDate?: string
  url?: string
}

const platformIcon: Record<string, React.ElementType> = {
  twitter: Twitter,
  x: Twitter,
  linkedin: Linkedin,
}

function PostCard({ post }: { post: Post }) {
  const Icon = platformIcon[post.platform?.toLowerCase() || ""] || Twitter
  return (
    <Card className="flex flex-col">
      <CardContent className="p-4 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground capitalize">{post.platform || "unknown"}</span>
        </div>
        <p className="text-sm line-clamp-3">{post.content?.substring(0, 100) || "No content"}</p>
        {post.scheduledDate && (
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(post.scheduledDate).toLocaleDateString()}
          </p>
        )}
        {post.url && (
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:underline mt-2 inline-flex items-center gap-1"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </CardContent>
    </Card>
  )
}

export default function ContentPage() {
  const [posts, setPosts] = useState<Post[] | null>(null)

  useEffect(() => {
    fetch("/api/postiz/posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => setPosts([]))
  }, [])

  if (posts === null) {
    return (
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-6">Content Pipeline</h2>
        <Skeleton className="h-64" />
      </div>
    )
  }

  const drafts = posts.filter((p) => p.status === "draft")
  const scheduled = posts.filter((p) => p.status === "scheduled")
  const published = posts.filter((p) => p.status === "published")

  const columns = [
    { title: "Draft", items: drafts },
    { title: "Scheduled", items: scheduled },
    { title: "Published", items: published },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-6">Content Pipeline</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
              {col.title} ({col.items.length})
            </h3>
            <div className="space-y-3">
              {col.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No posts</p>
              ) : (
                col.items.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
