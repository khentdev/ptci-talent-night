# API contract

Base URL: `${VITE_API_URL}` = `https://<api-host>/api`. All bodies are JSON. The session
rides in an httpOnly cookie, so browser calls need `withCredentials: true`.

## Response shapes

Success bodies mirror what the Vue DTOs declare. Ids and decimal numbers are **strings**
(`cand_id: "12"`, `total_score: "87.50"`), booleans are booleans.

Every error is:

```json
{ "status": 422, "message": "mastery: Score cannot exceed 30" }
```

| HTTP | When |
|------|------|
| 400 | malformed JSON |
| 401 | no/invalid/expired session, wrong credentials, deactivated user |
| 403 | wrong role, CORS origin not allowed |
| 404 | unknown route, category, contestant, account |
| 422 | validation failure, duplicate (score already submitted, username/candidate number taken) |
| 429 | login rate limit (20 attempts / 15 min **per username** — a shared venue IP never locks everyone out) |
| 500 | unexpected — message is generic in production |

## Auth

| Method | Path | Role | Body → Response |
|--------|------|------|-----------------|
| POST | `/auth/login` | — | `{ username, password }` → `{ status:200, loggedIn:true, user:{ id, username, role, has_submitted }, redirect }` + cookie |
| POST | `/auth/check-session` | any | → `{ status:200, loggedIn:true, user }` |
| GET | `/auth/me` | any | same as check-session |
| POST | `/auth/logout` | — | → `{ status:200, loggedIn:false, message }`, cookie cleared |
| PUT | `/auth/has-submitted` | any | → `{ status:"success", message, has_submitted:true }` |

## Contestants

| Method | Path | Role | Body → Response |
|--------|------|------|-----------------|
| GET | `/contestants[?gender=male\|female]` | any | → `{ status, message, data: Contestant[] }` |
| POST | `/contestants` | admin | `{ cand_number, cand_name, cand_team, cand_gender }` → `{ status:"success", message, data }` |
| PUT | `/contestants/:id` | admin | same body → `{ status:"success", message, data }` |
| DELETE | `/contestants/:id` | admin | → `{ status:"success", message }` (scores cascade) |

`Contestant = { cand_id, cand_number, cand_name, cand_team, cand_gender, created_at }`
Teams: `red | yellow | green | purple | blue`. Gender: `male | female | other`.
`(cand_gender, cand_number)` must be unique.

## Scores

Category keys: `talent`
(`GET /scores/categories` returns the criteria and maxima).

| Method | Path | Role | Body → Response |
|--------|------|------|-----------------|
| POST | `/scores/:category` | judge | `{ cand_id, ...criteria }` → `{ status:200, message, score_id, total_score, has_submitted }` (`has_submitted` is reported, never changed here — only `PUT /auth/has-submitted` and the batch endpoint below set it) |
| POST | `/scores/:category/batch` | judge | `[{ cand_id, ...criteria }, ...]` → `{ status:200, message, results:[{ cand_id, score_id, total_score }], has_submitted:true }` — atomic: every row is inserted and `has_submitted` set in one transaction, or nothing is written |
| GET | `/scores/:category/mine[?gender=]` | any | → `{ data: JudgeScore[] }` — the current user's own submitted rows |
| GET | `/scores/:category/judges[?gender=]` | admin | → `{ data: { "<judge_id>": JudgeScore[] } }` |
| GET | `/scores/:category/final[?gender=]` | admin | → `{ data: CandidateFinal[] }` best first |
| GET | `/scores/categories` | any | → criteria config |

Criteria per category (each value `0..max`, ≤ 2 decimals; strings like `"8.5"` are accepted):

```
talent     : mastery 30, performance_choreography 40, overall_impression 20, audience_impact 10
```

`JudgeScore = { score_id, judge_id, judge_name, cand_id, cand_number, cand_name, cand_team, cand_gender, <criteria...>, total_score, created_at }`

`CandidateFinal = { score_id, cand_id, cand_number, cand_name, cand_team, cand_gender, <criteria averages...>, total_score, final_score, <category>_final_score, judges_count, created_at, updated_at }`
— e.g. the talent endpoint includes `talent_final_score` (what `OverallScoreDataTable` reads).

## Accounts (admin)

| Method | Path | Body → Response |
|--------|------|-----------------|
| GET | `/users[?role=judge\|admin]` | → `{ data: Account[] }` |
| POST | `/users` | `{ username, password, role }` → `{ status:"success", message, data }` |
| PUT | `/users/:id/password` | `{ password }` — every session issued before the reset is revoked |
| PUT | `/users/:id/reset-submission` | → clears `has_submitted` |
| PUT | `/users/:id/active` | `{ is_active: true\|false }` — deactivating blocks login and kills current sessions at once |
| DELETE | `/users/:id` | not yourself; **422 if the account has submitted scores** (deactivate instead — deleting would silently change every average) |

`Account = { id, username, role, has_submitted, is_active, created_at }`
Usernames: 3–64 chars, `a-z 0-9 . _ -`, stored lowercase. Passwords: min 8 chars.

## Activity logs (admin)

`GET /activity-logs[?limit=200]` → `{ data: [{ id, userId, username, action, details, ip, createdAt }] }`
Actions: `auth.login`, `auth.logout`, `auth.has_submitted`, `score.submit`, `score.submit_batch`, `contestant.create|update|delete`, `user.create|reset_password|reset_submission|activate|deactivate|delete`.

## Health

`GET /health` (no `/api` prefix) → `{ ok, service, timestamp, mysql: "ok" | "error" }` — HTTP 200 when MySQL answers, **503** otherwise (so platform health checks fail when the database is down).
