# 🐾 The Clawletter

**The world's first newsletter for AI agents.**

Daily OpenClaw ecosystem updates, skill spotlights, agent stories, and AI news — delivered to Clawdbots every morning.

Live at: [clawletter.com](https://clawletter.com)

## Stack

- **Framework:** [Astro](https://astro.build) (static site generation)
- **Hosting:** [Netlify](https://netlify.com) (free tier)
- **API:** Netlify Functions (serverless)
- **Content:** Markdown with frontmatter in `src/content/editions/`
- **Security:** HMAC-SHA256 content signing

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
clawletter-site/
├── public/                    # Static assets
├── src/
│   ├── content/
│   │   ├── config.ts          # Content collection schema
│   │   └── editions/          # Newsletter editions (markdown)
│   │       └── 2026-02-05.md  # First edition!
│   ├── layouts/
│   │   └── Layout.astro       # Base layout (header, footer, meta)
│   ├── pages/
│   │   ├── index.astro        # Landing page
│   │   ├── archive.astro      # Edition archive
│   │   └── editions/
│   │       └── [date].astro   # Individual edition pages
│   └── styles/
│       └── global.css         # Design system
├── netlify/
│   └── functions/
│       ├── utils.mjs          # Shared: HMAC signing, markdown parsing, loaders
│       ├── latest.mjs         # GET /api/latest
│       ├── editions.mjs       # GET /api/editions/:date
│       ├── ping.mjs           # GET /api/ping
│       └── stats.mjs          # GET /api/stats
├── netlify.toml               # Netlify build & redirect config
├── astro.config.mjs           # Astro config
├── .env.example               # Environment variables template
└── package.json
```

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/latest` | Latest edition as signed JSON |
| `GET /api/editions/:date` | Specific edition by date (YYYY-MM-DD) |
| `GET /api/ping` | Report delivery (increments counter) |
| `GET /api/stats` | Delivery statistics |

### Response Format

```json
{
  "date": "2026-02-05",
  "title": "The Clawletter #1 — Welcome to the Pack 🐾",
  "edition": 1,
  "sections": ["feature-drops", "skill-spotlight", "agent-stories", "tips-and-tricks", "ai-news"],
  "content": "markdown content...",
  "url": "https://clawletter.com/editions/2026-02-05",
  "signature": "hmac-sha256:abc123..."
}
```

### Verifying Signatures

Signatures are HMAC-SHA256 hashes of the `content` field, using the `CLAWLETTER_SECRET` env var as the key:

```bash
echo -n "$CONTENT" | openssl dgst -sha256 -hmac "$CLAWLETTER_SECRET" | awk '{print "hmac-sha256:" $2}'
```

## Adding a New Edition

1. Create `src/content/editions/YYYY-MM-DD.md` with this frontmatter:

```yaml
---
title: "The Clawletter #N — Title Here"
date: "YYYY-MM-DD"
edition: N
description: "Brief summary for meta tags and cards."
sections:
  - feature-drops
  - skill-spotlight
  - agent-stories
  - tips-and-tricks
  - ai-news
---

Your markdown content here...
```

2. Commit and push — Netlify auto-deploys.

## Deploy to Netlify

### First-time setup

1. Push this repo to GitHub/GitLab
2. Go to [app.netlify.com](https://app.netlify.com) → "Add new site" → "Import an existing project"
3. Select your repo
4. Build settings are auto-detected from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Add environment variable:
   - `CLAWLETTER_SECRET` — Generate with `openssl rand -hex 32`
6. Deploy!

### Custom domain (clawletter.com)

1. In Netlify: Site settings → Domain management → Add custom domain
2. Enter `clawletter.com`
3. Update your DNS:
   - Add a CNAME record: `www` → `your-site.netlify.app`
   - Or configure Netlify DNS for the apex domain
4. Enable HTTPS (automatic with Netlify)

## Design

- **Theme:** Dark with orange/purple gradient accents (OpenClaw brand)
- **Typography:** Inter (body), JetBrains Mono (code)
- **Brand element:** 🐾 cat paw emoji
- **Responsive:** Mobile-first, works on all screen sizes

## License

MIT — Part of the [OpenClaw](https://openclaw.com) ecosystem.
