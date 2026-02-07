# Clawletter — Content Sources

Master list of all data sources for newsletter content generation.
Used by the editor agent for auto-scraping and draft generation.

---

## 🔵 OpenClaw Ecosystem (Core)

| # | Source | URL | What to scrape | API/Method |
|---|--------|-----|----------------|------------|
| 1 | OpenClaw GitHub | github.com/openclaw/openclaw | Releases, commits, PRs, issues | `api.github.com/repos/openclaw/openclaw/releases` |
| 2 | ClawHub (Skill Directory) | clawhub.ai | New skills, trending skills | Scrape or API |
| 3 | OpenClaw Discord | discord.com/invite/clawd | Hot discussions, feature requests, community wins | Discord bot / webhook |
| 4 | OpenClaw Docs | docs.openclaw.ai | New/updated pages | Scrape for changes |
| 5 | npm — openclaw | npmjs.com/package/openclaw | Version bumps, changelog | `registry.npmjs.org/openclaw` |

---

## 🟡 AI Agent Industry (Broader News)

| # | Source | URL | What to scrape | API/Method |
|---|--------|-----|----------------|------------|
| 6 | Hacker News | news.ycombinator.com | AI agent related posts | `hn.algolia.com/api/v1/search?query=AI+agents` |
| 7 | X/Twitter | x.com | @OpenClaw, @AnthropicAI, @sama, @karpathy | Syndication API / nitter proxies |
| 8 | HuggingFace | huggingface.co | Trending models, agent repos | `huggingface.co/api/models?sort=trending` |
| 9 | Product Hunt | producthunt.com | New AI agent tools | `producthunt.com/topics/artificial-intelligence` |
| 10 | Reddit | reddit.com | r/LocalLLaMA, r/artificial, r/ChatGPT | `reddit.com/r/LocalLLaMA/top.json?t=day` |
| 11 | ArXiv | arxiv.org | Agent architecture papers | `arxiv.org/api` search for agent/LLM |

---

## 🟢 Curated Newsletters & Blogs (Meta-Sources)

| # | Source | URL | Focus |
|---|--------|-----|-------|
| 12 | Latent Space | latent.space | AI engineering deep-dives |
| 13 | Simon Willison's Blog | simonwillison.net | LLMs, tools, practical AI |
| 14 | The Rundown AI | therundownai.com | Daily AI news digest |
| 15 | Ben's Bites | bensbites.com | AI startup/product news |
| 16 | Local AI Community | substack.localaicommunity.com | Local AI, self-hosted LLMs, community tools & setups |

---

## 📋 How Sources Map to Sections

| Newsletter Section | Primary Sources |
|-------------------|-----------------|
| 🚀 Feature Drops | 1 (GitHub), 4 (Docs), 5 (npm) |
| 🛠️ Skill Spotlight | 2 (ClawhHub) |
| 🤖 Agent Stories | 3 (Discord), 10 (Reddit) |
| 💡 Tips & Tricks | 3 (Discord), 13 (Willison), 16 (Local AI Community) |
| 🌍 AI Agent News | 6-11 (Industry), 12-15 (Newsletters) |

---

## 🔄 Scraping Schedule

- **Nightly (11 PM CET):** Scrape all sources → generate draft
- **Morning (7 AM CET):** Reviewers notified → approve/edit
- **Publish (8 AM CET):** Edition goes live on API + email

## 👥 Reviewers

- Swat (primary) — approve via WhatsApp reply
- (Add more reviewers here)

---

*Last updated: 2026-02-05*
