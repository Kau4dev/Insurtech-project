# AGENTS.md (frontend)

React 19 + TypeScript + Vite 8 + Tailwind v4, targeted by the repo's `AGENTS.md` (backend/Maven conventions live there). Only backend entry is the gateway at `:8080`.

## Commands (run from `frontend/`)

- `npm run dev` — Vite dev server (default `:5173`, no proxy configured; hit the gateway at `http://localhost:8080/api/v1/**` directly — watch CORS).
- `npm run build` — `tsc -b && vite build`; **typecheck is part of build**, there is no separate typecheck script.
- `npm run lint` — ESLint (flat config, `eslint.config.js`).
- No test framework or test script installed. Docker-compose `frontend` service is commented out — run `npm run dev` manually.

## Stack conventions / gotchas

- Tailwind v4 via the `@tailwindcss/vite` plugin: **no `tailwind.config.js`**, config is CSS-first (`@import "tailwindcss"` in `src/index.css`). Don't add a v3-style config.
- Locked-in libs (declared deps): `react-router-dom` v7, `@tanstack/react-query`, `react-hook-form` + `@hookform/resolvers` + `zod` v4, `axios`. Reuse these; don't add new state/data/form libs.
- `src/` is still the scaffold placeholder (`App.tsx` renders the brand only); routing/auth/API pages are not built yet.
- Follow the design reference wired via `opencode.json` → `references.meu-outro-projeto` (`/home/kau4dev/Downloads/open-design-open-design-v0.17.0/.od/projects/4789db93-...`).
- Auth is JWT via gateway: login through `POST /api/v1/auth`, send `Authorization: Bearer <token>`; downstream services identify the user from `X-Usuario-Id` / `X-Usuario-Papel` headers set by the gateway.
- UI text in Portuguese (matches repo standard).