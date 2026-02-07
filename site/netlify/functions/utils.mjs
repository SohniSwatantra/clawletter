import { createHmac } from 'crypto';

const SECRET = process.env.CLAWLETTER_SECRET || 'dev-secret-change-me';

/**
 * Sign content with HMAC-SHA256
 */
export function sign(content) {
  const hmac = createHmac('sha256', SECRET);
  hmac.update(typeof content === 'string' ? content : JSON.stringify(content));
  return `hmac-sha256:${hmac.digest('hex')}`;
}

/**
 * Build a CORS-enabled JSON response
 */
export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': status === 200 ? 'public, max-age=300' : 'no-cache',
    },
  });
}

/**
 * Error JSON response
 */
export function errorResponse(message, status = 500) {
  return jsonResponse({ error: message }, status);
}

/**
 * Parse markdown frontmatter (simple YAML parser for our known fields)
 */
export function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: markdown };

  const frontmatterStr = match[1];
  const content = match[2].trim();
  const meta = {};

  let currentKey = null;
  let inArray = false;
  let arrayValues = [];

  for (const line of frontmatterStr.split('\n')) {
    const trimmed = line.trim();

    if (inArray) {
      if (trimmed.startsWith('- ')) {
        arrayValues.push(trimmed.slice(2).replace(/^["']|["']$/g, ''));
        continue;
      } else {
        meta[currentKey] = arrayValues;
        inArray = false;
        arrayValues = [];
      }
    }

    const kvMatch = trimmed.match(/^(\w+):\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      let value = kvMatch[2].trim();

      if (value === '' || value === '>') {
        // Could be a multiline string or array
        currentKey = key;
        inArray = true;
        arrayValues = [];
        continue;
      }

      // Remove quotes
      value = value.replace(/^["']|["']$/g, '');

      // Parse numbers
      if (/^\d+$/.test(value)) {
        value = parseInt(value, 10);
      }

      meta[key] = value;
      currentKey = key;
    }
  }

  if (inArray && currentKey) {
    meta[currentKey] = arrayValues;
  }

  return { meta, content };
}

/**
 * Load all editions from the built static files
 * In Netlify Functions, we read from the filesystem
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const EDITIONS_DIR = join(process.cwd(), 'src', 'content', 'editions');

export function loadEdition(date) {
  try {
    const filePath = join(EDITIONS_DIR, `${date}.md`);
    const raw = readFileSync(filePath, 'utf-8');
    const { meta, content } = parseFrontmatter(raw);
    return {
      date: meta.date || date,
      title: meta.title || `The Clawletter — ${date}`,
      edition: meta.edition || 0,
      description: meta.description || '',
      sections: meta.sections || [],
      content,
      url: `https://clawletter.com/editions/${meta.date || date}`,
    };
  } catch {
    return null;
  }
}

export function loadAllEditions() {
  try {
    const files = readdirSync(EDITIONS_DIR)
      .filter((f) => f.endsWith('.md'))
      .sort()
      .reverse();

    return files
      .map((f) => loadEdition(f.replace('.md', '')))
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function loadLatestEdition() {
  const editions = loadAllEditions();
  return editions.length > 0 ? editions[0] : null;
}
