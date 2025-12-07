# Rust Docs MCP Server

> A cloud-hosted MCP server providing AI assistants with comprehensive access to Rust documentation from docs.rs, accessible via HTTP without local installation.

[Notes](./notes.md) | [TODOs](./todos.md) | [Analysis](./analysis.md)

---

## 🎉 Recent Updates (Dec 6, 2024)

**Prompts Updated & Resources Removed**

Changes:
- **Prompts**: Improved 6 task prompt templates to guide AI to use the tools and specify versions for accuracy.
- **Resources Removed**: We removed the earlier static Rust pattern resources in favor of a dynamic-first approach (see analysis for rationale). The MCP now relies on `get_item_docs`, `get_crate_overview`, and `list_modules` to fetch up-to-date docs from docs.rs.
- **Cache Strategy**: Cache TTLs were updated to make versioned doc caches long-lived and `latest` caches shorter for freshness.

See [analysis.md](./analysis.md) for details.

---

## Problem Statement

AI assistants building Rust applications need access to crate documentation from docs.rs. Existing Rust documentation MCPs (laptou/rust-docs-mcp-server, 0xkoda/mcp-rust-docs) require **local installation via npx/npm**. Many users prefer cloud-hosted MCPs that work via HTTP/SSE without downloading and running local processes.

## Unique Value Proposition

**Cloud-hosted via Mastra Cloud** - Connect via HTTP/SSE endpoint, no local installation required:

```json
{
  "mcpServers": {
    "rust-docs": {
      "url": "https://rust-docs-mcp.mastra.cloud/mcp"
    }
  }
}
```

vs. existing solutions requiring local execution:

```json
{
  "mcpServers": {
    "rust-docs": {
      "command": "npx",
      "args": ["-y", "rust-docs-mcp-server"]
    }
  }
}
```

## Gap Analysis: Existing Rust Docs MCPs

| MCP Server                    | Transport     | Install Required | Tools | Limitations                  |
| ----------------------------- | ------------- | ---------------- | ----- | ---------------------------- |
| `laptou/rust-docs-mcp-server` | stdio (local) | Yes (npx)        | 7     | Local execution only         |
| `0xkoda/mcp-rust-docs`        | stdio (local) | Yes (npx)        | 3     | Local execution only         |
| **rust-docs-mcp (ours)**      | HTTP/SSE      | **No**           | 4     | Cloud-hosted on Mastra Cloud |

## Key Discovery: docs.rs is Static

docs.rs serves fully static HTML - no JavaScript rendering required. Simple `fetch` requests return complete documentation:

```typescript
const response = await fetch("https://docs.rs/tauri/latest/tauri/");
const html = await response.text(); // Full content, no JS needed
```

This makes the MCP fully serverless-compatible and deployable on Mastra Cloud.

---

## Tool Design (4 Tools)

### 1. `search_crates`

**Purpose:** Search for Rust crates on crates.io

**Input:**

- `query` (string): Search terms

**Output:** List of matching crates with names, descriptions, and download counts

**Implementation:**

```typescript
const searchCratesTool = createTool({
  id: "search_crates",
  description: "Search for Rust crates on crates.io by name or keywords",
  inputSchema: z.object({
    query: z.string().describe("Search terms for crate discovery"),
    limit: z.number().optional().default(10).describe("Max results to return"),
  }),
  outputSchema: z.object({
    crates: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        version: z.string(),
        downloads: z.number(),
        documentation: z.string().optional(),
      })
    ),
  }),
  execute: async ({ context }) => {
    const response = await fetch(
      `https://crates.io/api/v1/crates?q=${encodeURIComponent(
        context.query
      )}&per_page=${context.limit}`
    );
    const data = await response.json();
    return { crates: parseCratesResponse(data) };
  },
});
```

### 2. `get_crate_overview`

**Purpose:** Get the main documentation page for a crate

**Input:**

- `crate` (string): Crate name, e.g., `"tauri"`, `"serde"`, `"tokio"`
- `version` (string, optional): Version or `"latest"`

**Output:** Crate overview including description, modules, features, and examples

**Implementation:**

```typescript
const getCrateOverviewTool = createTool({
  id: "get_crate_overview",
  description: "Get the main documentation page for a Rust crate from docs.rs",
  inputSchema: z.object({
    crate: z.string().describe("Crate name: 'tauri', 'serde', 'tokio', etc."),
    version: z.string().optional().default("latest").describe("Crate version"),
  }),
  outputSchema: z.object({
    name: z.string(),
    version: z.string(),
    description: z.string(),
    modules: z.array(z.string()),
    features: z.array(z.string()),
    content: z.string(),
    url: z.string(),
  }),
  execute: async ({ context }) => {
    const cratePath = context.crate.replace(/-/g, "_");
    const url = `https://docs.rs/${context.crate}/${context.version}/${cratePath}/`;
    const response = await fetch(url);
    const html = await response.text();
    return parseCrateOverview(html, context.crate, context.version, url);
  },
});
```

### 3. `get_item_docs`

**Purpose:** Get documentation for a specific item (struct, enum, trait, function, macro)

**Input:**

- `crate` (string): Crate name
- `item_type` (string): One of `"struct"`, `"enum"`, `"trait"`, `"fn"`, `"macro"`, `"type"`
- `item_name` (string): Name of the item
- `module` (string, optional): Module path if not at crate root

**Output:** Complete documentation including signature, description, methods, and examples

**Implementation:**

```typescript
const getItemDocsTool = createTool({
  id: "get_item_docs",
  description:
    "Get documentation for a specific Rust item (struct, enum, trait, function, macro)",
  inputSchema: z.object({
    crate: z.string().describe("Crate name"),
    item_type: z
      .enum(["struct", "enum", "trait", "fn", "macro", "type"])
      .describe("Type of item"),
    item_name: z.string().describe("Name of the item"),
    module: z.string().optional().describe("Module path if not at crate root"),
  }),
  outputSchema: z.object({
    name: z.string(),
    type: z.string(),
    signature: z.string(),
    description: z.string(),
    methods: z.array(z.string()).optional(),
    variants: z.array(z.string()).optional(),
    implementations: z.array(z.string()).optional(),
    examples: z.string().optional(),
    url: z.string(),
  }),
  execute: async ({ context }) => {
    const cratePath = context.crate.replace(/-/g, "_");
    const modulePath = context.module ? `${context.module}/` : "";
    const url = `https://docs.rs/${context.crate}/latest/${cratePath}/${modulePath}${context.item_type}.${context.item_name}.html`;
    const response = await fetch(url);
    const html = await response.text();
    return parseItemDocs(html, context);
  },
});
```

### 4. `list_modules`

**Purpose:** List all modules and items in a crate or module

**Input:**

- `crate` (string): Crate name
- `module` (string, optional): Module path to list contents of

**Output:** Organized list of submodules, structs, enums, traits, functions, macros

**Implementation:**

```typescript
const listModulesTool = createTool({
  id: "list_modules",
  description: "List all modules and items in a Rust crate or specific module",
  inputSchema: z.object({
    crate: z.string().describe("Crate name"),
    module: z.string().optional().describe("Module path to explore"),
  }),
  outputSchema: z.object({
    modules: z.array(z.string()),
    structs: z.array(z.string()),
    enums: z.array(z.string()),
    traits: z.array(z.string()),
    functions: z.array(z.string()),
    macros: z.array(z.string()),
    types: z.array(z.string()),
    constants: z.array(z.string()),
    url: z.string(),
  }),
  execute: async ({ context }) => {
    const cratePath = context.crate.replace(/-/g, "_");
    const modulePath = context.module ? `${context.module}/` : "";
    const url = `https://docs.rs/${context.crate}/latest/${cratePath}/${modulePath}`;
    const response = await fetch(url);
    const html = await response.text();
    return parseModuleItems(html, url);
  },
});
```

---

## Project Structure (Full Mastra App)

```
rust-docs-mcp/
├── src/
│   └── mastra/
│       ├── tools/
│       │   ├── search-crates.ts
│       │   ├── get-crate-overview.ts
│       │   ├── get-item-docs.ts
│       │   └── list-modules.ts
│       ├── lib/
│       │   ├── parsers.ts      # HTML parsing utilities
│       │   ├── cache.ts        # In-memory caching
│       │   └── crates-io.ts    # crates.io API client
│       └── index.ts            # Mastra entry point with MCPServer
├── package.json
├── tsconfig.json
└── README.md
```

### Entry Point (src/mastra/index.ts)

```typescript
import { Mastra } from "@mastra/core/mastra";
import { MCPServer } from "@mastra/mcp";
import { searchCratesTool } from "./tools/search-crates";
import { getCrateOverviewTool } from "./tools/get-crate-overview";
import { getItemDocsTool } from "./tools/get-item-docs";
import { listModulesTool } from "./tools/list-modules";

// Create MCP Server with all 4 tools
const mcpServer = new MCPServer({
  name: "rust-docs-mcp",
  version: "1.0.0",
  description:
    "Cloud-hosted MCP server providing access to Rust documentation from docs.rs",
  tools: {
    search_crates: searchCratesTool,
    get_crate_overview: getCrateOverviewTool,
    get_item_docs: getItemDocsTool,
    list_modules: listModulesTool,
  },
});

// Export Mastra instance with MCP server
export const mastra = new Mastra({
  mcpServers: { "rust-docs": mcpServer },
});
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MCP Client                           │
│         (Claude, Cursor, VS Code, etc.)                 │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP/SSE (MCP Protocol)
┌─────────────────────────▼───────────────────────────────┐
│                   Mastra Cloud                          │
│         https://rust-docs-mcp.mastra.cloud              │
├─────────────────────────────────────────────────────────┤
│                  rust-docs-mcp                          │
│              (Mastra.ai Application)                    │
├─────────────────────────────────────────────────────────┤
│  Tools:                                                 │
│  • search_crates - Search crates.io                     │
│  • get_crate_overview - Get crate documentation         │
│  • get_item_docs - Get struct/enum/trait/fn docs        │
│  • list_modules - List crate contents                   │
├─────────────────────────────────────────────────────────┤
│  Implementation:                                        │
│  • Native fetch (serverless-compatible)                 │
│  • HTML-to-Markdown parsing                             │
│  • In-memory caching for performance                    │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP requests
┌─────────────────────────▼───────────────────────────────┐
│              External APIs                              │
│  • https://docs.rs/* (documentation)                    │
│  • https://crates.io/api/* (crate search)               │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Component    | Choice       | Reason                                        |
| ------------ | ------------ | --------------------------------------------- |
| Runtime      | Bun          | Fast, native TypeScript, good fetch support   |
| Framework    | Mastra.ai    | Full app framework with MCPServer integration |
| Deployment   | Mastra Cloud | Zero-config, auto-scaling, HTTP/SSE endpoints |
| HTML Parsing | cheerio      | Fast, jQuery-like HTML parsing                |
| Validation   | Zod          | Schema validation for tool inputs/outputs     |

---

## Success Criteria

1. **Cloud-Hosted:** Accessible via HTTP/SSE at Mastra Cloud URL
2. **No Installation:** Users connect via URL, no npx/npm required
3. **Functional:** All 4 tools return accurate documentation
4. **Performance:** Response time < 2s for page fetches
5. **Coverage:** Works with any crate on docs.rs

---

## Deployment on Mastra Cloud

### Setup Steps

1. Push code to GitHub
2. Connect repository to Mastra Cloud
3. Mastra Cloud auto-detects MCP server configuration
4. Deploys and provides HTTP/SSE endpoints

### Client Configuration

```json
{
  "mcpServers": {
    "rust-docs": {
      "url": "https://rust-docs-mcp.mastra.cloud/mcp"
    }
  }
}
```

### IDE Snippets (Auto-generated by Mastra Cloud)

**Cursor:**

```json
{
  "mcpServers": {
    "rust-docs": {
      "url": "https://rust-docs-mcp.mastra.cloud/sse"
    }
  }
}
```

**VS Code:**

```json
{
  "servers": {
    "rust-docs": {
      "type": "sse",
      "url": "https://rust-docs-mcp.mastra.cloud/sse"
    }
  }
}
```

---

## Companion MCP: Tauri Documentation

For developers building Tauri applications, use rust-docs-mcp alongside tauri-docs-mcp:

| MCP            | Focus                     | Tools |
| -------------- | ------------------------- | ----- |
| rust-docs-mcp  | Rust language & crates    | 4     |
| tauri-docs-mcp | Tauri framework & plugins | 4     |

### Combined Configuration

```json
{
  "mcpServers": {
    "rust-docs": {
      "url": "https://rust-docs-mcp.mastra.cloud/mcp"
    },
    "tauri-docs": {
      "url": "https://tauri-docs-mcp.mastra.cloud/mcp"
    }
  }
}
```

---

## Related Documents

- [Notes](./notes.md) - Research findings and technical details
- [TODOs](./todos.md) - Implementation tasks
