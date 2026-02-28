# PRD: Ava HQ — Core Dashboard (Phase 1)

## Introduction

Ava HQ is a password-protected web dashboard for monitoring AI agent operations across OpenClaw instances. Phase 1 delivers the core dashboard with agent status, GitHub integration, content pipeline view, and system health monitoring. Deployed as a Docker container on a VPS at hq.tkhongsap.io.

## Goals

- Provide real-time visibility into agent activity and work progress
- Show GitHub issues/PRs by milestone for active projects
- Display content pipeline status from Postiz (drafts/scheduled/published)
- Monitor system health (cron jobs, errors)
- Password-protect the dashboard (single user: Ta)
- Deploy as Docker container on port 3000 (Caddy proxies from 3100)

## User Stories

### US-001: Project scaffolding with Next.js + Tailwind + Shadcn
**Description:** As a developer, I need the base project set up so all future stories have a foundation to build on.

**Acceptance Criteria:**
- [ ] Next.js 14 with App Router initialized
- [ ] Tailwind CSS configured
- [ ] Shadcn/UI installed with dark theme as default
- [ ] Layout with sidebar navigation and main content area
- [ ] Environment variables setup (.env.example with all required vars)
- [ ] Dockerfile and docker-compose.yml for deployment
- [ ] Typecheck passes
- [ ] `npm run build` succeeds

### US-002: Simple password authentication
**Description:** As the owner, I want the dashboard protected by a password so only I can access it.

**Acceptance Criteria:**
- [ ] Login page with password input
- [ ] Password stored as hashed env variable (AUTH_PASSWORD_HASH)
- [ ] Session cookie set on successful login (24hr expiry)
- [ ] All routes redirect to login if not authenticated
- [ ] Logout button in sidebar
- [ ] Typecheck passes

### US-003: Dashboard homepage with summary cards
**Description:** As the owner, I want to see a high-level overview when I open HQ.

**Acceptance Criteria:**
- [ ] Summary cards showing: Total agents (4), Active issues count, Pending PRDs, Published posts count
- [ ] Cards fetch real data from GitHub and Postiz APIs
- [ ] Loading skeletons while data fetches
- [ ] Error states if APIs are unreachable
- [ ] Responsive layout (mobile + desktop)
- [ ] Typecheck passes

### US-004: Agent status panel
**Description:** As the owner, I want to see which agents exist and their basic info.

**Acceptance Criteria:**
- [ ] Panel showing 4 agents: Main (Orchestrator), Builder, Content, DocParser
- [ ] Each agent card shows: name, role description, model, status indicator
- [ ] Agent data loaded from a config file (agents.json) — not hardcoded in components
- [ ] Clean card layout with icons per agent type
- [ ] Typecheck passes

### US-005: GitHub issues view by milestone
**Description:** As the owner, I want to see GitHub issues organized by milestone so I can track project progress.

**Acceptance Criteria:**
- [ ] API route that fetches issues from GitHub API for a configurable repo
- [ ] Issues grouped by milestone (Phase 1, Phase 2, Phase 3)
- [ ] Each issue shows: title, number, state (open/closed), labels, assignee
- [ ] Progress bar per milestone (X of Y closed)
- [ ] Click issue title → opens GitHub issue in new tab
- [ ] Supports multiple repos (configurable via env: GITHUB_REPOS=owner/repo1,owner/repo2)
- [ ] Typecheck passes

### US-006: GitHub recent commits view
**Description:** As the owner, I want to see recent commits to track what Builder is shipping.

**Acceptance Criteria:**
- [ ] API route that fetches recent commits from configured repos
- [ ] Shows last 20 commits across all configured repos
- [ ] Each commit shows: message, author, repo, date, short SHA
- [ ] Click commit → opens on GitHub in new tab
- [ ] Auto-refreshes every 60 seconds
- [ ] Typecheck passes

### US-007: Content pipeline view (Postiz integration)
**Description:** As the owner, I want to see my content pipeline — drafts, scheduled, and published posts.

**Acceptance Criteria:**
- [ ] API route that fetches posts from Postiz API
- [ ] Three columns: Draft | Scheduled | Published
- [ ] Each post card shows: content preview (first 100 chars), platform icon (X/LinkedIn), scheduled date, status
- [ ] Click post → opens in Postiz (if URL available)
- [ ] Typecheck passes

### US-008: System health panel
**Description:** As the owner, I want to see if critical systems are running properly.

**Acceptance Criteria:**
- [ ] Health checks for: Postiz API reachable, GitHub API reachable, DNS resolution for hq.tkhongsap.io
- [ ] Green/yellow/red status indicators
- [ ] Last checked timestamp
- [ ] Manual refresh button
- [ ] Typecheck passes

### US-009: Docker deployment and CI
**Description:** As the owner, I want the app to auto-deploy when code is pushed to main.

**Acceptance Criteria:**
- [ ] Dockerfile builds a production Next.js image
- [ ] docker-compose.yml with environment variables
- [ ] GitHub Actions workflow: on push to main → SSH to VPS → pull → rebuild → restart container
- [ ] Container runs on port 3000, Caddy proxies from 3100
- [ ] Health check endpoint at /api/health
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Dashboard must be password-protected; all routes require authentication
- FR-2: GitHub data fetched server-side via Next.js API routes using GitHub App token
- FR-3: Postiz data fetched server-side via API routes using Postiz API key
- FR-4: All API keys stored as environment variables, never exposed to client
- FR-5: Dashboard uses dark theme by default
- FR-6: All pages responsive (mobile + desktop)
- FR-7: App runs in Docker container on port 3000

## Non-Goals (Phase 1)

- No real-time WebSocket updates (polling is fine for now)
- No Ralph pipeline view (Phase 2 — needs prd.json integration)
- No memory viewer (Phase 3)
- No real-time agent logs (Phase 3)
- No multi-instance support (Phase 2)
- No Notion integration
- No social media engagement metrics

## Technical Considerations

- Use Next.js App Router with server components for API calls
- GitHub API: use GitHub App installation token (App ID: 2827316, Installation ID: 108979899)
- Postiz API: https://api.postiz.com with bearer token
- Shadcn/UI for all components — consistent with tkhongsap.io tech stack
- Dark theme: slate/zinc palette, clean and minimal
- Deploy via Docker on same VPS as OpenClaw (port 3100 via Caddy)

## Success Metrics

- Dashboard loads in < 2 seconds
- All data refreshes without full page reload
- Can be accessed from phone
- Zero downtime deployment via Docker

## Open Questions

- Should we add email/Telegram alerts from the health panel? (defer to Phase 2)
- Should agent status eventually be real-time via OpenClaw API? (defer to Phase 2)
