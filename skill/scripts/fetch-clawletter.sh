#!/bin/bash
# Fetch the latest Clawletter edition from clawletter.com
# Usage: fetch-clawletter.sh [YYYY-MM-DD]
# Returns markdown content of the newsletter
#
# Environment variables:
#   CLAWLETTER_URL     — Base URL (default: https://clawletter.com)
#   CLAWLETTER_SECRET  — HMAC-SHA256 secret for signature verification (optional)

set -euo pipefail

BASE_URL="${CLAWLETTER_URL:-https://clawletter.com}"
DATE="${1:-}"

# ── Helper: verify HMAC-SHA256 signature ────────────────────────
verify_signature() {
  local content="$1"
  local signature="$2"

  if [[ -z "${CLAWLETTER_SECRET:-}" ]]; then
    # No secret configured — skip verification
    return 0
  fi

  if [[ -z "$signature" || "$signature" == "null" ]]; then
    echo "⚠️  Warning: No signature in response (cannot verify)" >&2
    return 0
  fi

  # Extract the hex digest from "hmac-sha256:abcdef..."
  local expected_hex="${signature#hmac-sha256:}"
  local actual_hex
  actual_hex=$(printf '%s' "$content" | openssl dgst -sha256 -hmac "$CLAWLETTER_SECRET" | awk '{print $NF}')

  if [[ "$expected_hex" == "$actual_hex" ]]; then
    echo "✅ Signature verified" >&2
    return 0
  else
    echo "❌ Signature mismatch! Content may be tampered with." >&2
    echo "   Expected: ${expected_hex}" >&2
    echo "   Got:      ${actual_hex}" >&2
    return 1
  fi
}

# ── Fetch specific date or latest ───────────────────────────────
if [[ -n "$DATE" ]]; then
  # Validate date format
  if ! [[ "$DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    echo "ERROR: Invalid date format. Use YYYY-MM-DD" >&2
    exit 1
  fi
  api_response=$(curl -sf "${BASE_URL}/api/editions/${DATE}" 2>/dev/null || true)
else
  api_response=$(curl -sf "${BASE_URL}/api/latest" 2>/dev/null || true)
fi

# ── Process API response ────────────────────────────────────────
if [[ -n "$api_response" ]] && echo "$api_response" | jq -e '.content' &>/dev/null; then
  content=$(echo "$api_response" | jq -r '.content')
  signature=$(echo "$api_response" | jq -r '.signature // empty')
  edition_date=$(echo "$api_response" | jq -r '.date // "unknown"')
  title=$(echo "$api_response" | jq -r '.title // "The Clawletter"')

  # Verify HMAC signature
  if verify_signature "$content" "$signature"; then
    echo "# ${title}"
    echo "**Date:** ${edition_date}"
    echo ""
    echo "$content"

    # Ping delivery confirmation
    curl -sf "${BASE_URL}/api/ping" >/dev/null 2>&1 || true
    exit 0
  else
    echo "ERROR: Signature verification failed. Refusing to display content." >&2
    exit 2
  fi
fi

# ── Fallback: try /api/latest if specific date failed ──────────
if [[ -n "$DATE" ]]; then
  latest=$(curl -sf "${BASE_URL}/api/latest" 2>/dev/null || true)
  if [[ -n "$latest" ]] && echo "$latest" | jq -e '.content' &>/dev/null; then
    content=$(echo "$latest" | jq -r '.content')
    signature=$(echo "$latest" | jq -r '.signature // empty')
    latest_date=$(echo "$latest" | jq -r '.date // "unknown"')
    title=$(echo "$latest" | jq -r '.title // "The Clawletter"')

    if verify_signature "$content" "$signature"; then
      echo "# ⚠️ No edition for ${DATE} — showing latest"
      echo "# ${title}"
      echo "**Date:** ${latest_date}"
      echo ""
      echo "$content"

      curl -sf "${BASE_URL}/api/ping" >/dev/null 2>&1 || true
      exit 0
    fi
  fi
fi

echo "ERROR: Could not fetch Clawletter from ${BASE_URL}" >&2
echo "The site may not be live yet, or there may be a network issue." >&2
exit 1
