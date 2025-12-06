/**
 * Mastra Entry Point for Rust Docs MCP
 *
 * Cloud-hosted MCP server providing access to Rust documentation from docs.rs
 * Accessible via HTTP/SSE at Mastra Cloud without local installation.
 */

import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { MCPServer } from "@mastra/mcp";

// Import all tools
import { searchCratesTool } from "./tools/search-crates";
import { getCrateOverviewToolTurndown } from "./tools/get-crate-overview-turndown";
import { getItemDocsToolTurndown } from "./tools/get-item-docs-turndown";
import { listModulesToolTurndown } from "./tools/list-modules-turndown";

// Import prompts (workflow guides)
import { rustPrompts, getRustPromptMessages } from "./prompts/rust-prompts";

/**
 * Create MCP Server with all 4 Rust documentation tools (Turndown version)
 *
 * Philosophy: 100% dynamic, always up-to-date from docs.rs
 * - NO hardcoded Rust knowledge (would become outdated)
 * - ALL documentation fetched dynamically from docs.rs
 * - Prompts guide AI to USE the tools (workflows, not knowledge)
 *
 * Tools (Dynamic data from docs.rs):
 * - search_crates: Search for crates on crates.io
 * - get_crate_overview: Get main documentation page for a crate as Markdown
 * - get_item_docs: Get documentation for specific items as Markdown
 * - list_modules: List all modules and items in a crate or module as Markdown
 *
 * Prompts (Workflow guides that orchestrate tool usage):
 * - implement-trait - Guide AI to query trait docs, then implement
 * - add-async-support - Guide AI to query async runtime docs, then convert
 * - handle-errors-idiomatically - Guide AI to query error crate docs, then add handling
 * - add-send-sync-bounds - Guide AI to query Send/Sync docs, then add bounds
 * - fix-lifetime-errors - Guide AI to query type docs if needed, then fix
 * - optimize-for-performance - Guide AI to query perf docs, then optimize
 *
 * Each prompt EXPLICITLY tells AI to use tools first, ensuring up-to-date info.
 */
const rustDocsMcpServer = new MCPServer({
  name: "rust-docs-mcp",
  version: "1.0.0",
  description:
    "Cloud-hosted MCP server providing always up-to-date access to Rust crate documentation from docs.rs and crates.io. Zero hardcoded knowledge - everything fetched dynamically.",
  tools: {
    search_crates: searchCratesTool,
    get_crate_overview: getCrateOverviewToolTurndown,
    get_item_docs: getItemDocsToolTurndown,
    list_modules: listModulesToolTurndown,
  },
  prompts: {
    listPrompts: async () => rustPrompts,
    getPromptMessages: async ({ name, args }) => {
      const result = await getRustPromptMessages({ name, args });
      return result.messages;
    },
  },
});

/**
 * Export Mastra instance with MCP server
 *
 * When deployed to Mastra Cloud, this exposes:
 * - HTTP endpoint: https://{project}.mastra.cloud/mcp
 * - SSE endpoint: https://{project}.mastra.cloud/sse
 *
 * Client configuration:
 * ```json
 * {
 *   "mcpServers": {
 *     "rust-docs": {
 *       "url": "https://rust-docs-mcp.mastra.cloud/mcp"
 *     }
 *   }
 * }
 * ```
 */
export const mastra = new Mastra({
  mcpServers: { "rust-docs": rustDocsMcpServer },
  logger: new PinoLogger({
    name: "rust-docs-mcp",
    level: "info",
  }),
});
