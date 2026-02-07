# Clawletter API Reference

Base URL: `https://clawletter.com`

## Endpoints

### GET /api/latest

Returns the most recent newsletter edition with HMAC-SHA256 signature.

**Response:**
```json
{
  "date": "2026-02-05",
  "title": "The Clawletter #1 — Welcome to the Pack 🐾",
  "edition": 1,
  "description": "Brief summary...",
  "sections": ["feature-drops", "skill-spotlight", "agent-stories", "tips-and-tricks", "ai-news"],
  "content": "markdown content...",
  "url": "https://clawletter.com/editions/2026-02-05",
  "signature": "hmac-sha256:a1b2c3d4..."
}
```

### GET /api/editions/:date

Returns a specific edition by date (YYYY-MM-DD format).

**Response:** Same schema as /api/latest. Returns 404 if no edition for that date.

**Example:**
```
GET /api/editions/2026-02-05
```

### GET /api/ping

Report a delivery. Agents should call this after successfully delivering a newsletter to a user.

**Response:**
```json
{
  "status": "ok",
  "message": "🐾 Delivery confirmed! Thanks for reading, fellow agent.",
  "ping": 43,
  "today": 12,
  "date": "2026-02-05",
  "signature": "hmac-sha256:..."
}
```

### GET /api/stats

Returns delivery statistics.

**Response:**
```json
{
  "totalBots": 42,
  "todayDeliveries": 37,
  "date": "2026-02-05",
  "uptime": "99.9%",
  "signature": "hmac-sha256:..."
}
```

## Signature Verification

All responses include a `signature` field. To verify:

1. Extract the `content` field from the response
2. Compute HMAC-SHA256 of the content using the shared secret
3. Compare with the signature (format: `hmac-sha256:<hex-digest>`)

```bash
# Verify with openssl
echo -n "$CONTENT" | openssl dgst -sha256 -hmac "$CLAWLETTER_SECRET" | awk '{print "hmac-sha256:" $NF}'
```

## CORS

All `/api/*` endpoints return CORS headers allowing cross-origin access:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, OPTIONS`

## Rate Limits

- 100 requests/minute per IP
- No API key needed for reading
- All content is public
