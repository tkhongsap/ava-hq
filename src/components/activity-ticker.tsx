"use client"

import React from "react"

interface ActivityEvent {
  id: string
  timestamp: string
  agent: string
  type: "start" | "complete" | "error" | "info"
  message: string
  durationMs?: number
}

const AGENT_NAMES: Record<string, string> = {
  main: "Ava",
  builder: "Builder",
  content: "Content",
  atlas: "Atlas",
}

const typeColors: Record<string, string> = {
  complete: "text-green-400",
  start: "text-yellow-400",
  error: "text-red-400",
  info: "text-gray-400",
}

export function ActivityTicker({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="w-full bg-card border-t border-border px-4 py-3 text-center">
        <p className="text-xs text-muted-foreground">
          No activity in the last 76 hours
        </p>
      </div>
    )
  }

  const tickerContent = events.map((event) => {
    const time = new Date(event.timestamp).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    const agentName = AGENT_NAMES[event.agent] || event.agent
    return { ...event, time, agentName }
  })

  return (
    <div className="w-full bg-card border-t border-border overflow-hidden">
      <div className="ticker-wrapper">
        <div className="ticker-content">
          {/* Render twice for seamless loop */}
          {[0, 1].map((copy) => (
            <span key={copy} className="inline-flex items-center gap-0">
              {tickerContent.map((event, i) => (
                <span
                  key={`${copy}-${event.id}-${i}`}
                  className={`inline-flex items-center whitespace-nowrap px-4 text-xs ${typeColors[event.type]}`}
                >
                  <span className="font-mono">{event.time}</span>
                  <span className="mx-1">•</span>
                  <span className="font-semibold">{event.agentName}</span>
                  <span className="mx-1">•</span>
                  <span>{event.message.slice(0, 60)}</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .ticker-wrapper {
          padding: 8px 0;
        }
        .ticker-content {
          display: inline-flex;
          animation: ticker-scroll 40s linear infinite;
          white-space: nowrap;
        }
        .ticker-content:hover {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}
