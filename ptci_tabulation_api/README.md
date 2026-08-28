# IC2 Tabulation API

Backend for the **ic2-tabulation-frontend** (Vue 3) pageant tabulation app.

**Stack:** Fastify 5 · TypeScript (ESM) · MySQL 8 / MariaDB (Hostinger) · JWT session cookie (jose) · bcrypt · zod

```
Vue frontend  ──(axios, withCredentials)──▶  this API  ──▶  MySQL
     VITE_API_URL=https://api.example.com/api          Hostinger hPanel database
```

## Quick start (local)

```bash
cp .env.example .env          # then fill in MYSQL_* and a long JWT_SECRET
npm install
npm run seed -- --admin=admin:YourPassw0rd --judges=3 --judge-password=JudgePassw0rd --sample
npm run dev                   # http://localhost:3001  (tsx watch)
```

Point the frontend at it: in `ic2-tabulation-frontend/.env`

```env
VITE_API_URL=http://localhost:3001/api
VITE_MOCK_API=false
```

## Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Dev server with reload (`tsx watch src/index.ts`) |
| `npm run build` / `npm start` | Compile to `dist/` and run it (what Hostinger/Render use) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:init` | Create the tables (also happens automatically on every boot) |
| `npm run seed` | Create admin/judge accounts (+ sample contestants). See `src/db/seed.ts` header |
| `npm run test:api` | End-to-end test against a real MySQL database named `<MYSQL_DATABASE>_test` (wiped every run) |
| `npm run pack:hostinger` | Build + zip (`deploy/ic2-tabulation-api.zip`) for Hostinger's "Upload your files" / File Manager deploy |

## Project layout

```
src/
  index.ts              boot: env check → MySQL → schema → listen
  app.ts                buildApp(): plugins, CORS, cookies, routes (used by tests too)
  config/env.ts         all environment variables in one typed object
  db/                   pool.ts · initSchema.ts (CREATE TABLE IF NOT EXISTS) · schema.sql · seed.ts
  scoring/categories.ts the 7 judged categories, their criteria and maxima (single source of truth)
  plugins/              auth.ts (session cookie → request.user, requireRole) · errorHandler.ts
  routes/               health · auth · contestants · scores · users · activityLogs
  services/             validation + business rules
  repositories/         SQL only
  types/                shared TS types
test/api.test.ts        64 end-to-end checks (Fastify inject + real MySQL)
docs/                   API.md (endpoint contract) · HOSTINGER.md (deploy guide)
```

## How auth works

- `POST /api/auth/login` verifies the bcrypt hash and sets an **httpOnly cookie** (`ic2_token`) holding a signed JWT.
  The frontend never touches the token — axios just sends `withCredentials: true`.
- Every protected route verifies the JWT **and reloads the user from MySQL**, so deactivating an account (`PUT /api/users/:id/active`) or resetting its password cuts existing sessions immediately.
- Login is rate-limited **per username** (20 attempts / 15 min) rather than per IP, because every judge at the venue shares one public IP.
- `has_submitted` on the user is set only by `PUT /api/auth/has-submitted` (score submissions report it but never change it); admins can clear it with `PUT /api/users/:id/reset-submission`.
- A judge who has submitted scores cannot be deleted (422 + DB `ON DELETE RESTRICT`) — deactivate instead, so averages never change silently.
- Roles: `admin` (dashboard, contestants, accounts, scoreboards) · `judge` (score submission, top-5 roster).
- Behind a reverse proxy the client IP comes from `X-Forwarded-For` only when the proxy is a loopback/private peer (`TRUST_PROXY`, see `.env.example`).

## Scoring model

Each category is scored per judge per candidate, criteria sum to **100**:

| Category | Criteria (max) |
|----------|----------------|
| production | choreography 40 · projection 40 · audience_impact 20 |
| uniform | poise_and_bearings 40 · personality_and_projection 30 · neatness 20 · overall_impact 10 |
| swimwear | stage_presence 40 · figure_and_fitness 30 · poise_and_bearing 20 · overall_impact 10 |
| formalwear | poise_and_bearing 40 · personality/projection 30 · appropriateness/ellegance 20 · overall_impact 10 |
| qna | total_score 100 |
| talent | mastery 30 · performance_choreography 40 · overall_impression 20 · audience_impact 10 |
| top-five | qna 50 · beauty 50 |

- A judge can score a candidate **once** per category (`UNIQUE (judge_id, cand_id)` → HTTP 422 on repeat).
- Scoreboards average across judges: `/final` endpoints give per-candidate averages; `/overall` sums the six preliminary category averages (max 600); `/top-five/candidates` returns the 5 best per gender from that.

Full endpoint contract: [docs/API.md](docs/API.md). Deployment: [docs/HOSTINGER.md](docs/HOSTINGER.md).
