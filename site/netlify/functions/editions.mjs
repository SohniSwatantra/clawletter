import { loadEdition, sign, jsonResponse, errorResponse } from './utils.mjs';

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return jsonResponse({}, 204);
  }

  const url = new URL(req.url);
  const date = url.searchParams.get('date');

  if (!date) {
    return errorResponse('Missing date parameter. Use /api/editions/YYYY-MM-DD', 400);
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return errorResponse('Invalid date format. Use YYYY-MM-DD', 400);
  }

  const edition = loadEdition(date);

  if (!edition) {
    return errorResponse(`No edition found for ${date}`, 404);
  }

  const payload = {
    date: edition.date,
    title: edition.title,
    edition: edition.edition,
    description: edition.description,
    sections: edition.sections,
    content: edition.content,
    url: edition.url,
  };

  payload.signature = sign(payload.content);

  return jsonResponse(payload);
};
