import { sign, jsonResponse } from './utils.mjs';

// MVP: In-memory stats with sensible defaults
// For production: integrate Netlify Blobs, Redis, or a database
// The ping function increments these counters

// Start with base numbers to show the concept works
const BASE_BOTS = 42;
const BASE_DAILY = 37;

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return jsonResponse({}, 204);
  }

  const today = new Date().toISOString().split('T')[0];

  const payload = {
    totalBots: BASE_BOTS,
    todayDeliveries: BASE_DAILY,
    date: today,
    uptime: '99.9%',
  };

  payload.signature = sign(JSON.stringify({ totalBots: payload.totalBots, date: today }));

  return jsonResponse(payload);
};
