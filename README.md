# Ava HQ

Multi-instance OpenClaw command center and agent dashboard.

**Live:** https://hq.tkhongsap.io

## What It Does

Ava HQ is a real-time dashboard for monitoring and managing AI agent operations across OpenClaw instances.

- **Agent Activity** — Which agents are active, idle, or errored
- **Work Pipeline** — Issues → PRDs → Stories → Done (Kanban)
- **Content Pipeline** — Postiz drafts, scheduled, published
- **System Health** — Cron jobs, heartbeats, errors

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS + Shadcn/UI
- GitHub API (issues, PRs, commits)
- Postiz API (content pipeline)
- Simple auth (password-protected)
- Docker deployment

## Development

```bash
npm install
npm run dev
```

## Deployment

```bash
docker build -t ava-hq .
docker run -d --name ava-hq -p 3100:3000 --env-file .env ava-hq
```
