# Realtime and social APIs (Strapi)

Updated: 2026-02-10

This document describes the backend APIs implemented in `strapi/src/api/feed`, `strapi/src/api/corridors`, and `strapi/src/api/connection`.

## 1. Authentication and session model

- `GET /api/feed`, `POST /api/feed`, `GET /api/feed/stream`, and all `/api/connections*` routes require an authenticated JWT.
- Feed endpoints additionally validate the active session token (`sid` / `sv`) via `strapi/src/utils/auth-sessions.ts`.
- `GET /api/feed/highlights` and `GET /api/corridors/realtime` are public read endpoints.

## 2. Feed API

## 2.1 `GET /api/feed`

Purpose: authenticated paginated feed with cursor support.

Query parameters:

- `limit` (1..100, default `20`)
- `sort` (`NEWEST`, `URGENCY`, `VOLUME`, `CREDIBILITY`)
- `type` (`OFFER`, `REQUEST`, `ALERT`, `TENDER`, `CAPACITY`, `INDICATOR`)
- `mode` (`EXPORT`, `IMPORT`, `BOTH`)
- `sector` or `sectorId`
- `fromProvince` or `fromProvinceId`
- `toProvince` or `toProvinceId`
- `q` (search text)
- `cursor` (opaque base64url token returned by previous page)

Response:

- `data`: array of normalized feed items
- `cursor`: next cursor or `null`

Notes:

- Cursor + sort must match; mismatch returns `400`.
- Only `status=confirmed` items are returned.

## 2.2 `POST /api/feed`

Purpose: authenticated feed item creation.

Accepted payload keys (`data` wrapper optional):

- `type`, `title`, `summary`, `mode`
- `sectorId`, `fromProvinceId`, `toProvinceId`
- `quantity` (`value`, `unit`)
- `urgency`, `credibility`
- `tags`, `accessibilitySummary`, `geo`

Validation highlights:

- `title` min length `3`
- `summary` min length `10`
- `quantity` requires positive numeric `value` and supported `unit`

Idempotency:

- `Idempotency-Key` header is supported.
- If a matching item already exists for the same user + key, API returns that existing item.

Success response:

- `201` with `data` item.
- Broadcasts `feed.item.created` to SSE clients.

## 2.3 `GET /api/feed/highlights`

Purpose: public home highlights endpoint aligned with front filters.

Query parameters:

- `scope`: `canada` (default), `g7`, `world`
- `filter`: `all` (default), `offer`, `request`, `labor`, `transport`
- `q` or `search`
- `limit` (1..100, default `20`)
- Optional explicit overrides: `type`, `tag`

Response:

- `data`: filtered highlight items
- `meta`: `{ scope, filter, search, limit, count }`

Caching:

- `Cache-Control: public, max-age=30, stale-while-revalidate=30`

## 2.4 `GET /api/feed/stream`

Purpose: authenticated Server-Sent Events stream for feed updates.

SSE behavior:

- Content type: `text/event-stream; charset=utf-8`
- Heartbeat every `15s`
- Envelope shape:
  - `eventId`
  - `type` (`feed.item.created`, `feed.item.updated`, `feed.item.deleted`)
  - `payload`
  - `cursor` (optional)

## 3. Corridors realtime API

## 3.1 `GET /api/corridors/realtime`

Purpose: public payload for `HomeCorridorsRealtimeService`.

Query parameters:

- `limit` (1..12, default `5`)

Response shape:

- `titleKey`, `subtitleKey`
- `items[]` with `{ id, label, route, meta }`
- `status` with `{ level, labelKey }`
- `cta` with `{ labelKey }`
- `timestamp`

Fallback behavior:

- On query/build failure, returns a safe empty snapshot instead of hard failing.
- Success cache header: `Cache-Control: public, max-age=15, stale-while-revalidate=30`.

## 4. Connections API

## 4.1 `POST /api/connections`

Purpose: create a persistent connection entry for current user.

Required payload (`data` wrapper optional):

- `match`
- `buyer_profile`
- `supplier_profile`
- `intro_message` (20..2000 chars)
- `meeting_proposal` (1..8 ISO datetimes)

Optional payload:

- `locale` (`fr` or `en`)
- `attachments` (`nda`, `rfq`)
- `logistics_plan` (`incoterm`, `transports`)

Response:

- `201` with created connection and initial stage/status history.

## 4.2 `GET /api/connections`

Purpose: paginated history for current authenticated user.

Query parameters:

- `limit` (1..100, default `20`)
- `offset` (default `0`)
- `status` (`pending`, `inDiscussion`, `completed`, `closed`)

Response:

- `data[]`
- `meta` with `{ count, limit, offset, hasMore }`

## 4.3 `GET /api/connections/:id`

Purpose: fetch one connection if owned by current user.

Behavior:

- Returns `404` when the item does not belong to current user.

## 4.4 `PATCH /api/connections/:id/status`

Purpose: update status with transition control.

Allowed transitions:

- `pending` -> `inDiscussion | completed | closed`
- `inDiscussion` -> `completed | closed`
- `completed` -> `closed`
- `closed` -> none

Behavior:

- Invalid transition returns `400`.
- Updates stage/status history and `lastStatusAt`.

## 5. Integration test commands

Run from monorepo root:

```bash
yarn workspace @openg7/strapi test:integration:feed
yarn workspace @openg7/strapi test:integration:corridors
yarn workspace @openg7/strapi test:integration:connections
```

All scripts spin up Strapi in isolated test mode with temporary SQLite DB files.
