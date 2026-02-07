import { loadLatestEdition, sign, jsonResponse, errorResponse } from './utils.mjs';

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return jsonResponse({}, 204);
  }

  const edition = loadLatestEdition();

  if (!edition) {
    return errorResponse('No editions available', 404);
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
