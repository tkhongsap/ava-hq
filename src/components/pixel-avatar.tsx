"use client"

import type { AgentId } from "@/types/activity"

type AvatarStatus = "working" | "idle" | "error" | "offline"

interface PixelAvatarProps {
  agent: AgentId
  status?: AvatarStatus
  size?: number
}

const T = "transparent"

// 10x10 pixel art grids — each cell is a hex color or transparent
const AVATAR_GRIDS: Record<AgentId, string[][]> = {
  // Ava — warm tones, headset
  main: [
    [T, T, T, "#4a3728", "#4a3728", "#4a3728", "#4a3728", T, T, T],
    [T, T, "#4a3728", "#f5c6a0", "#f5c6a0", "#f5c6a0", "#f5c6a0", "#4a3728", T, T],
    [T, "#333", "#4a3728", "#f5c6a0", "#f5c6a0", "#f5c6a0", "#f5c6a0", "#4a3728", T, T],
    [T, "#555", T, "#3a2010", T, T, "#3a2010", T, T, T],
    [T, T, T, "#f5c6a0", "#f5c6a0", "#f5c6a0", "#f5c6a0", T, T, T],
    [T, T, T, T, "#e85d4a", T, T, T, T, T],
    [T, T, "#d4764e", "#d4764e", "#d4764e", "#d4764e", "#d4764e", "#d4764e", T, T],
    [T, T, "#d4764e", "#f0d0a0", "#d4764e", "#d4764e", "#f0d0a0", "#d4764e", T, T],
    [T, T, T, "#d4764e", T, T, "#d4764e", T, T, T],
    [T, T, "#5a3a28", "#5a3a28", T, T, "#5a3a28", "#5a3a28", T, T],
  ],
  // Builder — blue tones, hoodie
  builder: [
    [T, T, T, "#2d3a50", "#2d3a50", "#2d3a50", "#2d3a50", T, T, T],
    [T, T, "#2d3a50", "#e8c9a0", "#e8c9a0", "#e8c9a0", "#e8c9a0", "#2d3a50", T, T],
    [T, T, T, "#e8c9a0", "#e8c9a0", "#e8c9a0", "#e8c9a0", T, T, T],
    [T, T, T, "#2a1f10", T, T, "#2a1f10", T, T, T],
    [T, T, T, "#e8c9a0", "#e8c9a0", "#e8c9a0", "#e8c9a0", T, T, T],
    [T, T, T, T, "#d09080", T, T, T, T, T],
    [T, T, "#3b6ea5", "#3b6ea5", "#3b6ea5", "#3b6ea5", "#3b6ea5", "#3b6ea5", T, T],
    [T, "#3b6ea5", "#3b6ea5", "#5a9fd4", "#3b6ea5", "#3b6ea5", "#5a9fd4", "#3b6ea5", "#3b6ea5", T],
    [T, T, T, "#3b6ea5", T, T, "#3b6ea5", T, T, T],
    [T, T, "#2a3a4a", "#2a3a4a", T, T, "#2a3a4a", "#2a3a4a", T, T],
  ],
  // Content — purple tones, beret
  content: [
    [T, T, "#6b3fa0", "#6b3fa0", "#6b3fa0", "#6b3fa0", "#6b3fa0", T, T, T],
    [T, T, "#6b3fa0", "#6b3fa0", "#6b3fa0", "#6b3fa0", "#6b3fa0", "#6b3fa0", T, T],
    [T, T, T, "#f0c8a8", "#f0c8a8", "#f0c8a8", "#f0c8a8", T, T, T],
    [T, T, T, "#3a2518", T, T, "#3a2518", T, T, T],
    [T, T, T, "#f0c8a8", "#f0c8a8", "#f0c8a8", "#f0c8a8", T, T, T],
    [T, T, T, T, "#c07a6a", T, T, T, T, T],
    [T, T, "#8b5fb0", "#8b5fb0", "#8b5fb0", "#8b5fb0", "#8b5fb0", "#8b5fb0", T, T],
    [T, T, "#8b5fb0", "#c8a0e0", "#8b5fb0", "#8b5fb0", "#c8a0e0", "#8b5fb0", T, T],
    [T, T, T, "#8b5fb0", T, T, "#8b5fb0", T, T, T],
    [T, T, "#4a2a60", "#4a2a60", T, T, "#4a2a60", "#4a2a60", T, T],
  ],
  // Atlas — green tones, glasses
  atlas: [
    [T, T, T, "#2a4a2a", "#2a4a2a", "#2a4a2a", "#2a4a2a", T, T, T],
    [T, T, "#2a4a2a", "#e0c098", "#e0c098", "#e0c098", "#e0c098", "#2a4a2a", T, T],
    [T, T, T, "#e0c098", "#e0c098", "#e0c098", "#e0c098", T, T, T],
    [T, T, "#c0c0c0", "#1a1a40", "#c0c0c0", "#c0c0c0", "#1a1a40", "#c0c0c0", T, T],
    [T, T, T, "#e0c098", "#e0c098", "#e0c098", "#e0c098", T, T, T],
    [T, T, T, T, "#b07a6a", T, T, T, T, T],
    [T, T, "#3a7a4a", "#3a7a4a", "#3a7a4a", "#3a7a4a", "#3a7a4a", "#3a7a4a", T, T],
    [T, T, "#3a7a4a", "#70b080", "#3a7a4a", "#3a7a4a", "#70b080", "#3a7a4a", T, T],
    [T, T, T, "#3a7a4a", T, T, "#3a7a4a", T, T, T],
    [T, T, "#2a3a2a", "#2a3a2a", T, T, "#2a3a2a", "#2a3a2a", T, T],
  ],
}

export function PixelAvatar({ agent, status = "idle", size = 64 }: PixelAvatarProps) {
  const grid = AVATAR_GRIDS[agent] || AVATAR_GRIDS.main

  return (
    <div
      className={`relative ${status === "idle" || status === "offline" ? "opacity-70" : ""}`}
      style={{ width: size, height: size }}
    >
      <div
        className={status === "working" ? "animate-pulse" : ""}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(10, 1fr)",
          width: size,
          height: size,
          aspectRatio: "1",
        }}
      >
        {grid.flat().map((color, i) => (
          <div
            key={i}
            style={{
              backgroundColor: color,
            }}
          />
        ))}
      </div>
      {status === "error" && (
        <div
          className="absolute inset-0 bg-red-500/30 animate-pulse rounded"
          style={{ pointerEvents: "none" }}
        />
      )}
    </div>
  )
}
