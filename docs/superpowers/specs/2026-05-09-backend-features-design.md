# Backend features design — kickball-planner

Date: 2026-05-09
Status: approved, ready for implementation planning

## Goal

Replace the current localStorage-only frontend with a backed API that persists users, teams, players, and game plans. Ship the schema and auth as foundations, then build feature CRUD in parallel via separate PRs / Claude agents.

## Scope

In scope:
- Email/password signup + login + sessions (no third-party vendor)
- Teams owned by a user
- Players scoped to a team (name, pronouns, strengths)
- Game plans scoped to a team, containing a kicking order and per-inning field lineups

Out of scope (this iteration):
- Migrating existing localStorage data — greenfield (the app has no real users yet)
- Sharing a team across multiple users (designed-for, not built)
- Frontend changes to consume the new API
- Recommendation engine driven by strengths (the strength enum is being shaped to support this later, but the engine itself is not built here)

## Architecture overview

- Runtime: Cloudflare Workers (already scaffolded with Hono)
- DB: Cloudflare D1 (SQLite-on-CF), accessed via drizzle-orm for type-safe queries
- Auth: roll-our-own — bcryptjs password hashing, opaque session tokens stored in a `sessions` table, set as an `HttpOnly; Secure; SameSite=Lax` cookie

**Timestamp storage convention**: D1/SQLite has no native TIMESTAMP type. All `created_at` / `expires_at` columns are stored as INTEGER (unix milliseconds since epoch) — drizzle's default `integer({ mode: 'timestamp_ms' })`. This avoids string-parsing in queries and matches what `Date.now()` returns in Workers.

**Shared constants location**: enums used by both backend and (eventually) frontend live in `shared/constants.ts` at the repo root. Both `client/` and `cloudflare-workers/` import from it. This is added as part of issue #1 (Foundation).
- Authorization unit: the **team** is the access-control boundary. Anything under a team (players, game plans, lineups) is reachable iff the user owns the team. A single helper, `requireTeamAccess(teamId)`, is the chokepoint; switching to multi-user-per-team later means changing that one helper plus adding a `team_members` table.

## Data model

### users
| column | type | notes |
|---|---|---|
| id | uuid (text) | pk |
| email | text | unique, not null |
| password_hash | text | bcrypt |
| created_at | timestamp | default now |

### sessions
| column | type | notes |
|---|---|---|
| id | text | pk; random token, also the cookie value |
| user_id | uuid (text) | fk → users.id, on-delete cascade |
| expires_at | timestamp | |
| created_at | timestamp | default now |

### teams
| column | type | notes |
|---|---|---|
| id | uuid (text) | pk |
| owner_id | uuid (text) | fk → users.id; single owner for now |
| name | text | not null |
| created_at | timestamp | default now |

### players
| column | type | notes |
|---|---|---|
| id | uuid (text) | pk |
| team_id | uuid (text) | fk → teams.id, on-delete cascade |
| name | text | not null |
| pronouns | text | nullable; free-form (e.g. "she/her", "they/them") |
| created_at | timestamp | default now |

### player_strengths
| column | type | notes |
|---|---|---|
| player_id | uuid (text) | fk → players.id, on-delete cascade |
| strength | text | one of the fixed enum values |

Primary key: (player_id, strength).

### game_plans
| column | type | notes |
|---|---|---|
| id | uuid (text) | pk |
| team_id | uuid (text) | fk → teams.id, on-delete cascade |
| name | text | not null (e.g. "vs Red Sox 5/15") |
| created_at | timestamp | default now |

### kicking_order_entries
| column | type | notes |
|---|---|---|
| game_plan_id | uuid (text) | fk → game_plans.id, on-delete cascade |
| position | int | 1-based batting order slot |
| player_id | uuid (text) | fk → players.id |

Primary key: (game_plan_id, position). Unique constraint on (game_plan_id, player_id) — a player kicks at most once per plan.

A player being present in this table = "playing in this game." There is no separate "selected players" concept.

### inning_lineups
| column | type | notes |
|---|---|---|
| game_plan_id | uuid (text) | fk → game_plans.id, on-delete cascade |
| inning_number | int | 1-based |
| field_position | text | one of the fixed position enum values |
| player_id | uuid (text) | fk → players.id, not null |

Primary key: (game_plan_id, inning_number, field_position).

A position with no assigned player is represented by **the absence of a row**, not a row with NULL. This keeps the schema and the query "who's on the field this inning?" simpler (just SELECT the rows that exist).

## Enums (TypeScript constants, validated at API boundary)

### Strengths
```
POWER_KICKER       — kicks deep
PLACEMENT_KICKER   — bunts, hits gaps
FAST               — good baserunner
STRONG_ARM         — long, accurate throw
RELIABLE_CATCHER   — catches popups consistently
QUICK_HANDS        — infield reaction time
OUTFIELD_RANGE     — covers ground
LEADERSHIP         — vocal, organizes the field
```

### Field positions
The 10 already used by the frontend (`client/App.jsx`):
```
Pitcher, Catcher, 1st Base, 2nd Base, 3rd Base, Shortstop,
Left Field, Left Center, Right Center, Right Field
```

These live in shared TS constants so frontend and backend can import the same source of truth.

## Auth flow

Endpoints:
- `POST /api/auth/signup` — body `{email, password}`. Hashes password (bcryptjs), inserts user, creates session row, returns 201 with `Set-Cookie: session=<token>`.
- `POST /api/auth/login` — same body. Verifies hash, creates session, sets cookie.
- `POST /api/auth/logout` — deletes the session row, clears the cookie.
- `GET /api/me` — returns the current user (id, email) or 401.

Session token: random 32-byte URL-safe string. Stored as the row's `id` (so cookie value = primary key, single index lookup). Expiry: 30 days from creation. Cookie attributes: `HttpOnly; Secure; SameSite=Lax; Path=/`.

Middleware:
- `requireAuth` — reads `session` cookie, looks up the row, checks `expires_at > now`, sets `c.set('userId', userId)` on the Hono context. Otherwise returns 401.
- `requireTeamAccess(teamId)` — calls `requireAuth`, then verifies `teams.owner_id = ctx.userId`. Returns 403 if not. Used by every team-scoped route.

bcrypt note: use `bcryptjs` (pure JS); the native `bcrypt` binding does not run on Workers.

## Endpoint surface

```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/me

GET    /api/teams                          list user's teams
POST   /api/teams                          create
GET    /api/teams/:id
PATCH  /api/teams/:id                      rename
DELETE /api/teams/:id                      cascades to players/game_plans/lineups

GET    /api/teams/:id/players              list
POST   /api/teams/:id/players              create (name, pronouns, strengths[])
PATCH  /api/players/:id                    update name/pronouns/strengths
DELETE /api/players/:id

GET    /api/teams/:id/game-plans
POST   /api/teams/:id/game-plans
GET    /api/game-plans/:id                 plan + kicking order + all inning lineups
PATCH  /api/game-plans/:id                 rename
DELETE /api/game-plans/:id

PUT    /api/game-plans/:id/kicking-order   replace whole order with [player_id, ...]
PUT    /api/game-plans/:id/innings/:n      replace one inning with {field_position: player_id}
DELETE /api/game-plans/:id/innings/:n
```

`PUT` semantics on the lineup endpoints — the body is the full new state for that resource (whole order, or whole inning). Simpler for the frontend than diff-style PATCH and avoids partial-update consistency issues.

Validation: a player referenced by `kicking_order_entries` or `inning_lineups` must belong to the same team as the game plan. Enforced at the application layer (D1 doesn't give us cross-table CHECK constraints we'd want).

## Parallel work breakdown

```
#1 Foundation                     (blocks #2)
   D1 binding (wrangler.jsonc), drizzle setup, full schema as one migration,
   bcryptjs dependency added, dev/preview/test wiring. No endpoints yet.

#2 Auth                           (blocks #3, #4, #5)
   /api/auth/signup, /api/auth/login, /api/auth/logout, /api/me.
   requireAuth + requireTeamAccess middleware.

#3 Teams CRUD                     (parallel with #4 and #5 after #2)
#4 Players CRUD (incl. strengths) (parallel with #3 and #5 after #2)
#5 Game plans + lineups           (parallel with #3 and #4 after #2)
```

#4 and #5 only need a team **row** to test against (created via fixture in tests), not #3's HTTP endpoints. After #2 lands, three agents can take #3/#4/#5 in any order.

## Testing strategy

Each PR ships with tests using `@cloudflare/vitest-pool-workers`. Tests run Hono inside a real Workers runtime against a real D1 instance (in-memory or temp file — pool default). No mocks for the database or for bcrypt.

Per-PR test surface:
- **#1 Foundation**: smoke test that the migration applies cleanly and drizzle can query each table.
- **#2 Auth**: signup creates a user + sets a cookie; login with right/wrong password; logout invalidates session; `requireAuth` rejects missing/expired sessions; `requireTeamAccess` rejects non-owners.
- **#3 Teams**: list/create/get/rename/delete; auth and team-access enforced; deletion cascades.
- **#4 Players**: CRUD; strength validation (rejects unknown enum values); team-scoped access enforced; pronouns nullable.
- **#5 Game plans + lineups**: CRUD on plans; PUT kicking-order replaces atomically; PUT inning replaces atomically; rejects player IDs from a different team; full plan GET returns nested order + lineups.

## Open questions / TBD

None at design time. The strengths enum is locked for now and can be revisited when the recommendation engine work begins.
