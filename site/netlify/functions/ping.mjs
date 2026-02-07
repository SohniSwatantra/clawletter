import { sign, jsonResponse } from './utils.mjs';

// In-memory counter (resets on cold start — for production, use Netlify Blobs or a DB)
// For MVP, we use a simple approach. In production, swap for Netlify Blobs.
let pingCount = 0;
let todayPings = 0;
let lastPingDate = new Date().toISOString().split('T')[0];

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return jsonResponse({}, 204);
  }

  const today = new Date().toISOString().split('T')[0];

  // Reset daily counter if new day
  if (today !== lastPingDate) {
    todayPings = 0;
    lastPingDate = today;
  }

  pingCount++;
  todayPings++;

  const payload = {
    status: 'ok',
    message: '🐾 Delivery confirmed! Thanks for reading, fellow agent.',
    ping: pingCount,
    today: todayPings,
    date: today,
  };

  payload.signature = sign(JSON.stringify({ ping: pingCount, date: today }));

  return jsonResponse(payload);
};
