# 08 — Deployment and Environment

Evidence: `vercel.json`, `wrangler.jsonc`, `.vercel/` presence, `.env.example`, `package.json` scripts, `bunfig.toml`/`bun.lock` presence. No live deployment reachability check was performed (would require network access to a deployed URL not provided in this session) — deployment-URL status is marked BLOCKED, not verified working or broken.

## Local development setup

1. Install deps: `npm install` (lockfile is `package-lock.json`; `bun.lock`/`bunfig.toml` also present, so Bun is a supported alternate runtime/package manager — not independently tested in this audit).
2. Copy `.env.example` → `.env.local`, set `VITE_API_BASE_URL` (or leave unset in dev to rely on the `/api` proxy) and optionally `VITE_DEMO_OPEN_SIGNIN`.
3. Run backend locally on port 8010 (required for the dev proxy to have something to forward to) or point `VITE_API_BASE_URL` at a reachable deployed backend.
4. `npm run dev` → `vite dev`.

## Required runtime

Node.js (version not pinned in `package.json` `engines` — not found during this audit, so the minimum Node version is **UNKNOWN**; Vite 7 / TanStack Start generally require a current Node LTS). Bun is an alternate supported runtime per `bunfig.toml`.

## Environment variables (names only, no values — none were exposed in this audit)

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend origin, no trailing slash. Empty/unset in dev relies on the Vite proxy. |
| `VITE_DEMO_OPEN_SIGNIN` | When `true`, unrecognized sign-in emails auto-register a new empty org (demo convenience). Should be `false`/unset for strict auth per the `.env.example` comment. |

`.env.local` exists in the working tree (822 bytes) but its contents were **not read** in this audit — per the no-secrets rule, its presence is only confirmed, not inspected.

## Build output and deployment configuration

Two parallel deployment targets, both fully configured (not a migration-in-progress based on file completeness):

1. **Vercel (static SPA)** — `vercel.json`: `buildCommand: npm run vercel-build` (`vite build && node scripts/fix-vercel-static.mjs`), `outputDirectory: dist/client`, `framework: null`, SPA rewrite rule routing everything except `/assets/*` and extensioned files to `/index.html`. `.vercel/` directory present, confirming this project has been linked to a Vercel project at some point. `scripts/fix-vercel-static.mjs` exists as a post-build static-asset fixup specific to this target.
2. **Cloudflare Worker (SSR)** — `wrangler.jsonc`: worker name `niyo360`, `main: src/server.ts`, `nodejs_compat` compatibility flag, compatibility date `2025-09-24`. `.wrangler/` local build artifacts present. This target serves the TanStack Start SSR bundle rather than the static client bundle.

## Current deployment status

**BLOCKED** — no live URL was provided or reachability-tested in this session. The presence of `.vercel/` and `.wrangler/` artifact directories indicates both targets have been built/deployed from this machine at least once historically, but this audit did not confirm either is the organization's actual production deployment, nor check whether they're currently serving traffic. Do not treat this repo's config completeness as proof of a live, working production deployment.

## Local vs production differences

- Dev uses the Vite `/api` proxy; production (either target) requires `VITE_API_BASE_URL` to be set at build time (Vite env vars are inlined at build, not runtime-configurable after the fact) — meaning the Vercel/Cloudflare build must be built with the correct backend URL baked in, and changing backends requires a rebuild, not just a config change. This is a meaningful operational constraint worth flagging to the next engineer.
- The Cloudflare target runs real SSR (`src/server.ts`); the Vercel target serves a static SPA shell with client-side-only rendering per its rewrite rule — these are architecturally different runtime behaviors for the same codebase, not just different hosts.

## Known cold-start/CORS/API-URL issues

- CORS: `.env.example`'s own comment warns "The backend must list this frontend's origin in its `FRONTEND_ORIGIN` setting or the browser will block every request on CORS" — this is a real, documented operational dependency on backend configuration that the frontend cannot work around.
- No cold-start-specific issue was found documented in this repo; Cloudflare Workers generally have fast cold starts by platform design, but this was not independently measured.

## Safe setup/troubleshooting steps

1. If the UI shows no data on all `api-*` screens: check `VITE_API_BASE_URL` is set correctly for the target environment, and that the backend's CORS allowlist includes the frontend's actual origin.
2. If `npm run dev` shows API calls failing: confirm a backend is actually running on `localhost:8010` (the dev proxy target is hardcoded in `vite.config.ts`, not env-driven).
3. If sign-in auto-creates unexpected empty organizations: check `VITE_DEMO_OPEN_SIGNIN` is not accidentally `true` in that environment.
