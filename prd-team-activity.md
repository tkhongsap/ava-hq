# PRD: Virtual Office — Team Activity Page (Ava HQ)

## Overview

Add a "Team" page to Ava HQ (the existing Next.js 14 mission control dashboard) that visualizes AI agent activity as a **pixel-art virtual office**. Each agent (Ava, Builder, Content, Atlas) has their own workstation. Working agents animate at their desks; idle agents appear in the Break Room. A scrolling activity ticker shows the last 76 hours of work.

**This is a new page added to the existing Ava HQ codebase** on branch `ralph/core-dashboard`.

---

## Design Direction

### Visual Style: Warm Pixel Art Office
- **NOT** neon/sci-fi/CRT — warm wood tones, cozy pixel aesthetic
- Color-coded rooms per agent role (warm brown for Ava, blue for Builder, purple for Content, green for Atlas)
- Pixel font (`Press Start 2P` from Google Fonts) for room labels and status badges
- Regular Inter font for body text and sidebar (matches existing Ava HQ)
- Dark background consistent with existing Ava HQ dark theme but rooms have warm-toned floors

### Agent Avatars & Desks
Each agent gets a unique visual identity using **CSS pixel art** (colored grid blocks — no external image assets needed for MVP):

| Agent | Role Badge | Room Color | Desk Items (emoji) |
|-------|-----------|------------|-------------------|
| **Ava** | Orchestrator | Warm brown/orange | 🖥🖥🖥 ☕ 📋 |
| **Builder** | Engineer | Deep blue | 💻 ⌨️ 🥤 ⚙️ |
| **Content** | Creator | Purple | 📱 📝 🎨 ✏️ |
| **Atlas** | Analyst | Forest green | 📊 🌐 📈 🔍 |

### Shared Spaces
- **Break Room** — idle agents appear here with ☕ and 🍕. Cozy couch + coffee machine vibe.
- **Conference Room** — reserved for future multi-agent collaboration visualization (empty with chairs for now).

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Sidebar │  Team Activity                    ⏱ 22:13:45 [↻]    │
│         │                                                       │
│         │  ┌──────────────┐ ┌──────────────────────────────┐   │
│ Dash    │  │ TEAM STATUS  │ │        OFFICE FLOOR          │   │
│ Agents  │  │              │ │                              │   │
│ Issues  │  │ [ALL][WORK]  │ │  ┌──────────┐ ┌──────────┐  │   │
│ Content │  │ [IDLE]       │ │  │ AVA      │ │ BUILDER  │  │   │
│ Health  │  │              │ │  │ 🟢 Work  │ │ 🟡 Idle  │  │   │
│★Team    │  │ ● AVA  WORK  │ │  │ [avatar] │ │ [avatar] │  │   │
│         │  │   Fix nighty │ │  │ 🖥🖥☕    │ │ 💻⌨️🥤   │  │   │
│         │  │ ● BLDR IDLE  │ │  │ "Fixing  │ │          │  │   │
│         │  │ ● CONT IDLE  │ │  │  nightly"│ │          │  │   │
│         │  │ ● ATLS IDLE  │ │  ├──────────┤ ├──────────┤  │   │
│         │  │              │ │  │ CONTENT  │ │ ATLAS    │  │   │
│         │  │ ── STATS ──  │ │  │ 🟡 Idle  │ │ 🟡 Idle  │  │   │
│         │  │ Done: 12     │ │  │ [avatar] │ │ [avatar] │  │   │
│         │  │ Running: 1   │ │  │ 📱📝🎨   │ │ 📊🌐📈   │  │   │
│         │  │ Failed: 0    │ │  ├──────────┴─┴──────────┤  │   │
│         │  │ Avg: 4m 22s  │ │  │ BREAK ROOM    ☕🍕🛋  │  │   │
│         │  └──────────────┘ │  │ [idle agents here]     │  │   │
│         │                   │  ├────────────────────────┤  │   │
│         │                   │  │ CONFERENCE     🪑🪑🪑  │  │   │
│         │                   │  │ (empty)                │  │   │
│         │                   │  └────────────────────────┘  │   │
│         │                                                       │
│         │  ┌───────────────────────────────────────────────────┐│
│         │  │ ACTIVITY: 10:05 Ava fixed extraction • 08:00 ... ││
│         │  └───────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## API Design

### `GET /api/activity`

Query params: `hours=76` (default)

```typescript
interface AgentStatus {
  id: string              // "ava" | "builder" | "content" | "atlas"
  name: string
  role: string            // "Orchestrator" | "Engineer" | "Creator" | "Analyst"
  status: "working" | "idle" | "error" | "offline"
  currentTask?: string
  location: "desk" | "breakroom" | "conference"
  lastActive: string      // ISO timestamp
}

interface ActivityEvent {
  id: string
  timestamp: string       // ISO
  agent: string           // agent id
  type: "start" | "complete" | "error" | "info"
  message: string
  durationMs?: number
  link?: string           // URL to PR, commit, etc.
}

interface TeamOverviewResponse {
  agents: AgentStatus[]
  events: ActivityEvent[]
  stats: {
    completed: number
    running: number
    failed: number
    avgDurationMs: number
  }
  serverTime: string
}
```

**Data sources (server-side):**
1. Read `/data/.openclaw/agents/*/sessions/*.jsonl` — parse session metadata for agent, task, start/end time
2. Read live sessions via filesystem stat (recently modified = active)
3. Parse cron job logs for Daily Brief and Nightly Extraction
4. Fallback: read `activity-log.json` for manually logged events

---

## Components

### 1. Team Status Panel (left side)
- Filter toggles: `[ALL]` `[WORKING]` `[IDLE]` — pixel font, small pill buttons
- Agent list: status dot + name + badge + current task (truncated) + duration
- Stats block: completed/running/failed/avg duration — monospace, terminal style

### 2. Office Floor Plan (main area)
- CSS Grid layout of room cards
- Each room: colored header bar with agent name + role badge + status dot
- Room body: CSS pixel avatar (centered) + emoji desk items
- **Working state**: subtle pulse animation on avatar, task text in speech bubble
- **Idle state**: avatar appears in Break Room instead, desk shows empty chair
- **Error state**: red border flash on room card

### 3. Agent Avatars (CSS pixel art)
- 8x8 or 10x10 CSS grid of colored cells — each agent has distinct colors/pattern
- Rendered via a small React component using CSS Grid with `aspect-ratio: 1`
- No external image assets required — pure CSS
- Each avatar: ~64px displayed size

### 4. Activity Ticker (bottom bar)
- Full-width bar at the bottom
- Auto-scrolling right-to-left (CSS animation)
- Last ~20 events, color-coded: green=complete, yellow=start, red=error
- Pause on hover
- Pixel font for timestamps, regular font for messages

### 5. Live Clock (header)
- Top-right corner, updates every second
- Monospace font, format: `HH:MM:SS`
- Refresh button next to it

---

## Sidebar Integration

Add to `sidebar.tsx` navItems array:
```typescript
{ href: "/activity", label: "Team", icon: Users }
```

Using `Users` icon from lucide-react. Position: after "Health".

---

## User Stories

### US-001: Activity API Endpoint
Create `/api/activity/route.ts` that scans agent session transcripts from disk, detects live vs completed sessions, computes stats, and returns `TeamOverviewResponse`.

### US-002: Page Shell + Team Status Panel
Create `/activity/page.tsx` with the page header (title + live clock + refresh), left-side Team Status panel (agent list with status dots, filter toggles, stats block). Wire to `/api/activity`. Loading skeletons.

### US-003: CSS Pixel Art Avatars
Create a `PixelAvatar` component that renders each agent as a unique CSS pixel-art character using CSS Grid. 4 distinct designs matching agent roles. Include working/idle animation states.

### US-004: Office Floor Plan Grid
Build the room grid layout — 4 agent rooms (2x2), Break Room (full width), Conference Room (full width). Rooms show agent name, role badge, status dot, desk emoji items. Idle agents move to Break Room. Working agents show speech bubble with current task.

### US-005: Activity Ticker Bar
Bottom scrolling ticker showing recent events from the API. Auto-scroll with CSS animation. Color-coded by type. Pause on hover. Pixel font for timestamps.

### US-006: Sidebar + Integration + Polish
Add "Team" nav item to sidebar. Import `Press Start 2P` font. Add warm room color-coding. Responsive behavior (stack vertically on mobile). Error states.

---

## Technical Notes

- **No new npm dependencies** — everything uses existing Shadcn/UI, Tailwind, lucide-react, and CSS
- **One new Google Font** — `Press Start 2P` via `@import` in the page component (not global)
- **Data reads filesystem** — the API route reads session files from `/data/.openclaw/agents/` which is accessible on the server
- **Existing patterns** — follow the same `useEffect` + `fetch` + `useState` + `Skeleton` pattern used in all other Ava HQ pages
- **Branch** — all work on existing `ralph/core-dashboard` branch
