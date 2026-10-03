# CEO Demonstration Walkthrough

**Status: IMPLEMENTED, UNVERIFIED.** Every route/screen named below is confirmed present in the code (`src/context/AppContext.tsx`'s `SCREEN_IDS`, `src/components/shell/Sidebar.tsx`). The step-by-step flow itself was **not** run in a browser this session — the backend at `VITE_API_BASE_URL`/`http://localhost:8010` was unreachable (`curl` to `/api/v1/auth/me` returned connection refused), so login and every data-dependent step below are **BLOCKED**, not demonstrated. Run this guide once against a reachable backend and update this status line.

## Before the demo

- Confirm `.env.local` points `VITE_API_BASE_URL` at a reachable backend and the backend's `FRONTEND_ORIGIN` allows this frontend's origin (CORS).
- Sign in with the Asterion Medical Systems demo account. Login (`src/components/screens/Login.tsx`) takes only **email + password** — no org picker. An email the backend doesn't recognize auto-registers an empty new org when `VITE_DEMO_OPEN_SIGNIN=true`; keep it `false` for the real demo account so you land in the seeded Asterion org, not an empty one.
- The synthetic regulatory document referenced below must already exist in that org (backend-seeded) — this frontend does not create demo data.

## Step-by-step (screen id in parentheses — type into the sidebar click path, not a URL you type)

1. **Dashboard** (`dashboard`) — "Command Centre." Five KPI tiles (Products/Markets/Processes/Authorities/Sources) are live-API counts; the "Recent activity" panel is live audit data; everything else on this screen (change-activity chart, agent cards, pillar cards) is explicitly tagged `source="illustrative"` in the UI — point that out rather than letting it pass as live.
2. **Regulatory Sources** (`api-sources`) — confirm the source the synthetic document was ingested from is listed.
3. **Documents** (`api-documents`) → open the synthetic document (`api-document-detail`). Confirm it's clearly identifiable as the demo/synthetic one (title/description set by the backend seed).
4. On the document detail screen, click **Process Document** if `processing_status` isn't already terminal. The status badge now auto-polls (fixed this session — previously required a manual refresh) and will update through `PARSING`/`ANALYZING` to `ANALYZED` or `FAILED` without you touching Refresh.
5. **Regulatory Changes** (`api-changes`) → open the change extracted from that document (`api-change-detail`). Its **Obligations** panel lists the obligations this change produced.
6. **Obligations** (`api-obligations`) — can also be browsed directly; each row opens the change that produced it (`api-change-detail`).
7. Potentially affected entities: **Products** (`api-products`), **Markets** (`api-markets`), **Processes** (`api-processes`) — these are live registries, not computed from the change; there is no single screen that shows "entities potentially affected by change X" without going through Impact Analysis (next step).
8. **Impact Analysis** (`api-impact-analyze`) — pick the regulatory change from the real dropdown (populated from `useRegulatoryChanges`, not a pasted UUID) and run/inspect the assessment.
9. **Impact Assessments** (`api-impact`) → open the resulting assessment (`api-impact-detail`). Shows matched entities, rationale, and AI-enrichment status fields as returned by the backend — framed as "potentially affected" / "requires review", never as a confirmed violation (verified: no "non-compliant"/"violation"/"confirmed" language anywhere in this screen).
10. **Human Review** (`api-reviews`) — record or inspect a decision on the assessment via "Record decision." Decisions are explicit and tied to an actor/status.
11. **Actions** (`api-actions`) — open the action raised from the assessment; status changes use the real mutation (`useSetActionStatus`), and terminal states (Completed/Cancelled) show explanatory text instead of a silently disabled button.
12. **Evidence** (`api-evidence`) → attach or open evidence (`api-evidence-detail`); download is wrapped in error handling that distinguishes "file no longer available" (410) from other failures.
13. **Impact Reports** (`api-reports`) — generate/download the report for the assessment.
14. **Audit Trail** (`audit`) — filter to the demo entities above to show the full event history of everything just done.

## What to say out loud (accuracy matters more than polish)

- "This document is a synthetic example for demonstration — not a real regulation, real customer complaint, or verified legal finding."
- When showing the dashboard's illustrative cards (change-activity trend, agent/pillar cards), say "illustrative" — the UI already labels them that way; don't contradict it live.
- If a reviewer's or action owner's name shows as a truncated ID instead of a name: that's a known backend gap (no `/users` endpoint to resolve other users' names), not a frontend bug — see `09-known-issues-and-technical-debt.md`.

## Known limitations going into a live demo

- No end-to-end browser run has verified this sequence works against a live backend — do a dry run first.
- No real upload-progress percentage exists (backend doesn't expose one); don't imply otherwise.
- "AI Enriched" is never claimed as a label anywhere in the UI — only the backend's literal `processing_status` / `ai_enrichment_status` values are shown, so don't narrate enrichment having happened unless the screen itself shows it.
