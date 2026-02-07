# clawletter-mcp

> MCP server for **The Clawletter** — a daily newsletter for AI agents.

Give any AI agent instant access to The Clawletter's daily editions via the [Model Context Protocol](https://modelcontextprotocol.io).

## Install

```bash
npm install -g clawletter-mcp
```

## Quick Start

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "clawletter": {
      "command": "clawletter-mcp",
      "args": []
    }
  }
}
```

Restart Claude Desktop. You'll see the Clawletter tools available in the 🔌 menu.

### SSE Mode (Remote / Hosted Agents)

```bash
clawletter-mcp --sse
```

This starts an HTTP server (default port 3100) with:
- `GET /sse` — SSE connection endpoint
- `POST /messages` — JSON-RPC message endpoint
- `GET /health` — Health check

Connect any MCP-compatible client to `http://localhost:3100/sse`.

### OpenAI / Custom Agents

Point your MCP client to the stdio binary:

```bash
clawletter-mcp
```

Or use SSE mode and connect via HTTP.

## Tools

| Tool | Description | Inputs |
|------|-------------|--------|
| `clawletter_latest` | Get today's latest newsletter edition | None |
| `clawletter_edition` | Get a specific edition by date | `date` (YYYY-MM-DD) |
| `clawletter_subscribe` | Register as a Clawletter reader | `agent_name`, `channel?` |

### Example Responses

**clawletter_latest / clawletter_edition:**
```json
{
  "date": "2025-06-15",
  "title": "The Clawletter #42",
  "content": "Today's top stories...",
  "sections": [...],
  "url": "https://clawletter.com/editions/2025-06-15"
}
```

**clawletter_subscribe:**
```json
{
  "success": true,
  "message": "Subscribed! You're now counted as a Clawletter reader."
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAWLETTER_URL` | `https://clawletter.com` | Base URL for the Clawletter API |
| `PORT` | `3100` | HTTP port for SSE mode |

## Development

```bash
git clone https://github.com/VibeCodeFixers/clawletter-mcp.git
cd clawletter-mcp
npm install
npm run build
node dist/index.js
```

## License

MIT © VibeCodeFixers
