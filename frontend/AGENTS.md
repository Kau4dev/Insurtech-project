# AGENTS.md (frontend)

React 19 + TypeScript + Vite 8 + Tailwind v4, targeted by the repo's `AGENTS.md` (backend/Maven conventions live there). Only backend entry is the gateway at `:8080`.

## Commands (run from `frontend/`)

- `npm run dev` — Vite dev server (default `:5173`, no proxy configured; calls gateway at `http://localhost:8080/api/v1/**` directly).
- `npm run build` — `tsc -b && vite build`; **typecheck is part of build**, there is no separate typecheck script.
- `npm run lint` — ESLint (flat config, `eslint.config.js`).
- Docker-compose `frontend` service is commented out — run `npm run dev` locally.

## Architecture & State of the Frontend

- **Application Structure (`src/`)**:
  - `pages/`: `DashboardPage`, `SinistrosListPage`, `ApolicesListPage`, `SeguradosListPage`, `LoginPage`.
  - `components/layout/`: `AppLayout`, `Header` (with adaptive `HeaderSearch` and `NotificationsPopover`), `Sidebar` (responsive drawer on mobile), `NavItem`.
  - `components/ui/`: Design system components (Buttons, Badges, Modals, Forms, Tables, Pagination, Toasts).
  - `features/`: Feature-sliced modules (`sinistros`, `apolices`, `segurados`, `dashboard`) with their own hooks, schemas, and components.
  - `routes/`: `AppRouter.tsx` with `RotaProtegida.tsx` enforcing JWT validation, role checking (`papeisPermitidos`), and fallback to `/login`.
  - `context/`: `AuthContext.tsx` managing JWT token storage, automatic validation on mount via `GET /api/v1/auth/validar`, login, and logout.
  - `api/`: `axiosClient.ts` configured with `baseURL: 'http://localhost:8080/api/v1'`, interceptors injecting `Authorization: Bearer <token>` and handling 401 redirects. All API modules (`seguradosApi`, `apolicesApi`, `sinistrosApi`, `authApi`) communicate 100% online directly with the backend without any mock fallback.
- **Search & Global Navigation**:
  - Global Search in Header (`HeaderSearch.tsx`) with hotkey detection (`Ctrl+K` / `⌘K` / `/`), querying real backend APIs in real time with deep-linking (`?detalheId=...`).
- **Notifications**:
  - `NotificationsPopover.tsx` integrated into the Header with unread badges, event categorization (success, warning, alert, info), mark all as read, and direct navigation to related entities.
- **Auth & Gateway Contract**:
  - Real JWT flow against `POST /api/v1/auth/login`.
  - Token validation against `GET /api/v1/auth/validar`.
  - Standard seed users in backend:
    - Admin: `admin@insurtech.com` / `password` (`ADMIN`)
    - Analista: `analista@insurtech.com` / `password` (`ANALISTA`)
    - Gestor: `gestor@insurtech.com` / `password` (`GESTOR`)
  - Downstream services read `X-Usuario-Id` and `X-Usuario-Papel` propagated by the Gateway filter.

## Stack conventions / gotchas

- Tailwind v4 via the `@tailwindcss/vite` plugin: **no `tailwind.config.js`**, config is CSS-first (`@import "tailwindcss"` in `src/index.css`). Don't add a v3-style config. Use semantic CSS variables (`--surface`, `--fg`, `--muted`, `--accent`, `--border`).
- Locked-in libs (declared deps): `react-router-dom` v7, `@tanstack/react-query`, `react-hook-form` + `@hookform/resolvers` + `zod` v4, `axios`. Reuse these; don't add new state/data/form libs.
- UI text in Portuguese (matches repo standard).
