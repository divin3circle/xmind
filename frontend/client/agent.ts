import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { z } from "zod";

const MCP_SERVER_URL =
  process.env.MCP_SERVER_URL ?? "http://localhost:8787/sse";

const CLIENT_IDENTITY = { name: "xMind-frontend", version: "1.0.0" };
const CLIENT_CAPABILITIES = {
  capabilities: {
    sampling: {},
    roots: { listChanged: true },
  },
};

const ToolsListSchema = z.object({
  tools: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      inputSchema: z.unknown().optional(),
    }),
  ),
});

const ToolCallResultSchema = z.object({
  content: z
    .array(
      z.object({
        type: z.string(),
        text: z.string().optional(),
        data: z.unknown().optional(),
        source: z.unknown().optional(),
      }),
    )
    .optional(),
  isError: z.boolean().optional(),
});

type GeminiTool = {
  name: string;
  description?: string;
  parametersJsonSchema: Record<string, unknown>;
};

type ToolListResponse = z.infer<typeof ToolsListSchema>;
type ToolCallResponse = z.infer<typeof ToolCallResultSchema>;

let client: Client | null = null;
let transport: SSEClientTransport | null = null;
let connectPromise: Promise<Client> | null = null;

async function getClient(): Promise<Client> {
  if (client) return client;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    const serverUrl = new URL(MCP_SERVER_URL);

    transport = new SSEClientTransport(serverUrl, {
      requestInit: {
        headers: {
          Accept: "text/event-stream",
          "Content-Type": "application/json",
        },
      },
    });

    const mcpClient = new Client(CLIENT_IDENTITY, CLIENT_CAPABILITIES);
    await mcpClient.connect(transport);

    client = mcpClient;
    return mcpClient;
  })().catch((err) => {
    client = null;
    transport = null;
    connectPromise = null;
    throw err;
  });

  return connectPromise;
}

export async function listMcpTools(): Promise<GeminiTool[]> {
  const mcpClient = await getClient();

  const raw = await mcpClient.request(
    { method: "tools/list" },
    ToolsListSchema,
  );

  const parsed: ToolListResponse = raw;

  return parsed.tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parametersJsonSchema: (tool.inputSchema as
      | Record<string, unknown>
      | undefined) ?? {
      type: "object",
      properties: {},
    },
  }));
}

export async function callMcpTool(
  name: string,
  args: Record<string, unknown> = {},
): Promise<ToolCallResponse> {
  const mcpClient = await getClient();

  const result = await mcpClient.request(
    { method: "tools/call", params: { name, arguments: args } },
    ToolCallResultSchema,
  );

  return result;
}

export async function ensureMcpConnected(): Promise<Client> {
  return getClient();
}

export async function disconnectMcp(): Promise<void> {
  await client?.close();
  await transport?.close?.();
  client = null;
  transport = null;
  connectPromise = null;
}
