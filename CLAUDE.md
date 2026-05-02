# TechByBrewski — Portfolio & Agency Site

> A TechByBrewski Production

## Stack

- Next.js 15, React 19, TypeScript
- Firebase (Firestore, Auth) — Auth and Firestore only; App Hosting retired
- Tailwind CSS

## Hosting

- **Production:** Vercel — push to `main` triggers automatic deploy (production-only; preview deploys disabled)
- **Vercel project:** brewski-beers/techbybrewski (linked via GitHub integration)
- **Production URL:** https://techbybrewski.vercel.app/
- **NEVER add `output: export`** — Firebase Admin SDK breaks on static export

## Shared Secrets (GitHub Actions ↔ Vercel)

`BLOG_SCHEDULER_SECRET` is consumed by both GitHub Actions (blog-scheduler.yml, blog-publisher.yml) and the Vercel runtime (`/api/blog/*`). To prevent drift:

- **Single source of truth:** `.github/workflows/sync-blog-secret.yml` (workflow_dispatch). Writes the value to both GitHub Actions and all 3 Vercel envs, then redeploys.
- **NEVER edit `BLOG_SCHEDULER_SECRET` directly in GitHub or Vercel UI** — always run the sync workflow. Manual edits caused a 6-week scheduler outage (Mar 23 → May 2 2026).
- **Required GitHub secrets to run sync:** `GH_PAT_SECRETS_WRITE` (PAT with `repo > secrets:write`), `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT_ID`.
- **Same pattern for any future shared secret:** add a `sync-<name>.yml` workflow before introducing a second consumer.

## Project Structure

```
app/           — Next.js App Router (public + admin routes)
components/    — Shared UI components
lib/           — Firebase config, utilities
styles/        — Global CSS
scripts/       — Build/deploy scripts
```

## Engineering Principles

1. KISS — simplest working solution
2. YAGNI — don't build what isn't needed today
3. Scan before build — search for existing implementations first

## Commit Style

- Conventional Commits: feat|fix|refactor|chore|docs|test|perf|ci
- Never push directly to main

## Routing Rules (BrewCortex Agent Dispatch)

- **Planning/task breakdown** → `/plan` skill
- **Code changes** → spawn engineering agent
- **Research questions** → spawn research agent (Haiku)
- **Strategic reflection** → spawn strategist agent
- **Web design, UI audit, a11y, CSS** → spawn website agent
- **Website copy, CTAs, messaging** → spawn copy agent
- **Vercel/Firebase deployments, production health** → spawn monitoring agent
- **Code review** → `/review` skill

### Subagent Protocol

1. Parallel dispatch when subtasks are independent; sequential when dependent
2. Engineering agent gets full tool access when KB approves
3. Research agent runs on Haiku for speed and cost
4. Report subagent results back to KB — never silently
