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
import { getCrateOverviewTool } from "./tools/get-crate-overview";
import { getItemDocsTool } from "./tools/get-item-docs";
import { listModulesTool } from "./tools/list-modules";

/**
 * Create MCP Server with all 4 Rust documentation tools
 *
 * Tools:
 * - search_crates: Search for crates on crates.io
 * - get_crate_overview: Get main documentation page for a crate
 * - get_item_docs: Get documentation for specific items (struct, enum, trait, etc.)
 * - list_modules: List all modules and items in a crate or module
 */
const rustDocsMcpServer = new MCPServer({
  name: "rust-docs-mcp",
  version: "1.0.0",
  description:
    "Cloud-hosted MCP server providing access to Rust crate documentation from docs.rs and crates.io",
  tools: {
    search_crates: searchCratesTool,
    get_crate_overview: getCrateOverviewTool,
    get_item_docs: getItemDocsTool,
    list_modules: listModulesTool,
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
