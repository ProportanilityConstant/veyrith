# Veyrith API operations

## Authentication and rotation

Set `VEYRITH_API_KEYS` on the server as a comma-separated list of active secrets. Veyrith accepts every key in that list, so rotation is zero-downtime: add the new key, deploy, update consumers, verify traffic, then remove the old key and deploy again. `VEYRITH_API_KEY` remains supported as a single-key compatibility setting.

Keys are never stored in the database or returned by the API. Requests are compared with a timing-safe equality check, and only a short SHA-256 fingerprint is stored for analytics correlation.

## Rate limiting

`VEYRITH_API_RATE_LIMIT` controls the maximum number of blueprint-generation requests per key per rolling in-process minute. The default is `30`. Exceeded requests return `429 Too Many Requests` with a `Retry-After` header.

This limiter is intentionally conservative and local to each application instance. For a multi-instance deployment, put a shared gateway or Redis-backed limiter in front of the service before exposing it to untrusted high-volume traffic.

## Usage analytics

Successful, invalid, and generated/fallback blueprint requests are persisted to the `api_usage` table. The authenticated endpoint below returns a bounded 24-hour summary and at most 25 recent records:

```http
GET /api/v1/usage
Authorization: Bearer <key>
```

The response contains request count, successful count, generated count, average latency, and recent records. It does not return raw API keys or request briefs.

## Database setup

After pulling a release with database changes, run:

```bash
pnpm db:push
```

The migration adds the non-destructive `api_usage` table. Existing user data is not modified.
