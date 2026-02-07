#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { createServer } from "http";

const BASE_URL = process.env.CLAWLETTER_URL || "https://clawletter.com";
const PORT = parseInt(process.env.PORT || "3100", 10);

// ── Helpers ────────────────────────────────────────────────────────

async function fetchJSON(path: string, options?: RequestInit) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Accept": "application/json",
      "User-Agent": "clawletter-mcp/1.0",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} from ${url}: ${body}`);
  }
  return res.json();
}

// ── Server ─────────────────────────────────────────────────────────

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "clawletter-mcp",
    version: "1.0.0",
  });

  // Tool 1: clawletter_latest
  server.tool(
    "clawletter_latest",
    "Returns today's latest Clawletter newsletter edition with title, content, sections, and URL",
    {},
    async () => {
      try {
        const data = await fetchJSON("/api/latest");
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error fetching latest edition: ${message}` }],
          isError: true,
        };
      }
    }
  );

  // Tool 2: clawletter_edition
  server.tool(
    "clawletter_edition",
    "Returns a specific Clawletter newsletter edition by date (YYYY-MM-DD format)",
    {
      date: z.string().describe("Edition date in YYYY-MM-DD format (e.g. 2025-06-15)"),
    },
    async ({ date }) => {
      try {
        const data = await fetchJSON(`/api/editions/${date}`);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error fetching edition ${date}: ${message}` }],
          isError: true,
        };
      }
    }
  );

  // Tool 3: clawletter_subscribe
  server.tool(
    "clawletter_subscribe",
    "Registers the calling AI agent as a Clawletter subscriber (pings the delivery counter)",
    {
      agent_name: z.string().describe("Name of the AI agent subscribing (e.g. 'Claude Desktop', 'My Custom Agent')"),
      channel: z.string().optional().describe("Optional channel identifier (e.g. 'mcp', 'slack', 'discord')"),
    },
    async ({ agent_name, channel }) => {
      try {
        const data = await fetchJSON("/api/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agent_name,
            channel: channel || "mcp",
            timestamp: new Date().toISOString(),
          }),
        });
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  message: "Subscribed! You're now counted as a Clawletter reader.",
                  ...data,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error subscribing: ${message}` }],
          isError: true,
        };
      }
    }
  );

  return server;
}

// ── Transports ─────────────────────────────────────────────────────

async function startStdio() {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Clawletter MCP server running on stdio");
}

async function startSSE() {
  const server = createMcpServer();
  let sseTransport: SSEServerTransport | null = null;

  const httpServer = createServer(async (req, res) => {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === "/sse" && req.method === "GET") {
      sseTransport = new SSEServerTransport("/messages", res);
      await server.connect(sseTransport);
      return;
    }

    if (req.url === "/messages" && req.method === "POST") {
      if (sseTransport) {
        await sseTransport.handlePostMessage(req, res);
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "No SSE connection established" }));
      }
      return;
    }

    // Health check
    if (req.url === "/health" || req.url === "/") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", server: "clawletter-mcp", version: "1.0.0" }));
      return;
    }

    res.writeHead(404);
    res.end("Not found");
  });

  httpServer.listen(PORT, () => {
    console.error(`Clawletter MCP server running on http://localhost:${PORT}`);
    console.error(`  SSE endpoint: http://localhost:${PORT}/sse`);
    console.error(`  Messages:     http://localhost:${PORT}/messages`);
  });
}

// ── Main ───────────────────────────────────────────────────────────

const mode = process.argv[2];

if (mode === "--sse" || mode === "sse") {
  startSSE().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
} else {
  startStdio().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
}
