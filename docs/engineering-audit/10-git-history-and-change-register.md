# 10 — Git History and Change Register

Evidence: `git status --short --branch`, `git log --oneline -40`, `git branch -a`, `git remote -v`, `git fetch origin` — all run fresh in this session (2026-10-03).

## Current state

- Branch: `main`, tracking `origin/main`, **clean working tree**, no untracked/staged files.
- Local HEAD = remote HEAD = `491bf33` (confirmed via `git status --short --branch` showing no ahead/behind markers, and `git fetch origin` returning no new refs).
- Remote: `origin` → `https://github.com/WayamAI/Niyo360.git` (fetch+push).

## Branches

| Branch | Notes |
|---|---|
| `main` (current) | Up to date with `origin/main`. |
| `feat/enterprise-ui-overhaul` | Already merged into `main` via PR #3 (merge commit `f7ce872`). |
| `design-system-retrofit` | Local + remote branch exists; merge status into `main` not individually traced beyond what's visible in the linear log — not confirmed merged or abandoned. |
| `chore/rebrand-metadata-cleanup` | Local + remote branch exists; same caveat as above. |

## Chronological commit register (most recent 20, all dated 2026-10-02 — one concentrated session)

See the full table with problem/evidence in [05-ui-fixes-and-implementation-history.md](./05-ui-fixes-and-implementation-history.md). Order, newest first: `491bf33, 1c2085e, fd3ca21, 5788204, 38bedab, df40625, 1823dd2, f7ce872 (merge PR #3), b74ef66 (merge), 641a4ec, 8748f62, 3c094a9, 5c9a249, 45133e7, ea094a0, bd6b310, a077af0, 0b612fb, c37f8f0, 07dd839`.

## UI changes mapped to commits

All 7 "Chronos alignment" commits plus the 2 foundation commits (`0b612fb` tokens, `a077af0` shell) — see [05](./05-ui-fixes-and-implementation-history.md) for the full table.

## Test/verification changes mapped to commits

- `bd6b310` — added `client.test.ts` coverage for the dev-proxy/base-URL change.
- No other commit in the recent 20 added or modified a test file, based on the `git show --stat` output captured for the named commits plus the one-line summaries for the rest (not individually `--stat`-verified for every one of the 20 — flagged as a limitation).

## Uncommitted changes

None — working tree is clean (VERIFIED, `git status --short --branch` run immediately before writing this document).

## Files that must not be overwritten carelessly

- `src/services/api/schema.d.ts` — generated from `api/openapi.json` via `npm run api:types`; manual edits would be overwritten on next regeneration.
- `.env.local` — present, not inspected; contains local environment config, should never be committed (not currently tracked, per clean `git status`).
- `package-lock.json` — was the subject of a prior merge conflict (`b74ef66`); resolve conflicts here carefully rather than regenerating blindly.

## Known dependencies between frontend and backend work

- The frontend's 45 API hooks assume the backend implements the corresponding `api/v1/*` endpoints exactly as described in the committed `api/openapi.json` — any backend-side schema change requires re-running `npm run api:types` and reviewing the resulting diff in `schema.d.ts` and any now-mismatched call sites.
- `VITE_DEMO_OPEN_SIGNIN` behavior depends on backend registration logic actually accepting unrecognized emails as new orgs — a frontend flag alone does nothing without matching backend support.

## Remaining work not yet committed

None identified — the working tree is clean and `main` matches `origin/main`. Any "remaining work" is therefore prospective (see [11](./11-current-state-and-next-steps.md)), not already-written-but-uncommitted code.
