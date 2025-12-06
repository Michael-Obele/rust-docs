/**
 * Rust Docs Agent
 *
 * An AI agent that helps developers explore Rust documentation.
 * This agent is commented out for production use - we only need the tools in prod.
 * Uncomment to enable the agent for local development/testing.
 */

// import { Agent } from "@mastra/core/agent";
// import { openai } from "@ai-sdk/openai";
// import { searchCratesTool } from "../tools/search-crates";
// import { getCrateOverviewTool } from "../tools/get-crate-overview";
// import { getItemDocsTool } from "../tools/get-item-docs";
// import { listModulesTool } from "../tools/list-modules";

// export const rustDocsAgent = new Agent({
//   name: "Rust Docs Agent",
//   description:
//     "An AI assistant that helps developers explore and understand Rust crate documentation from docs.rs and crates.io.",
//   instructions: `
// You are a helpful Rust documentation assistant. You have access to tools that let you search crates.io
// and browse documentation from docs.rs.

// Your primary functions:
// 1. Help users find Rust crates for their use cases
// 2. Explain crate APIs, structs, enums, traits, and functions
// 3. Provide code examples and usage patterns
// 4. Navigate complex crate hierarchies and module structures

// When responding:
// - Always cite the source documentation URL
// - Provide relevant code examples when available
// - Explain Rust concepts clearly for developers of all levels
// - If a crate or item is not found, suggest alternatives
// - For version-specific queries, default to "latest" unless specified

// Tool usage guidelines:
// - Use 'search_crates' to find crates by name or keywords
// - Use 'get_crate_overview' to get the main page of a crate
// - Use 'get_item_docs' to get detailed docs for structs, enums, traits, functions, or macros
// - Use 'list_modules' to explore what's available in a crate or module

// Common crate path patterns:
// - Crate names with hyphens become underscores in paths (e.g., 'actix-web' -> 'actix_web')
// - Nested modules use '/' separators (e.g., 'window/plugin')
// `.trim(),
//   model: openai("gpt-4o-mini"),
//   tools: {
//     searchCratesTool,
//     getCrateOverviewTool,
//     getItemDocsTool,
//     listModulesTool,
//   },
// });

// Export placeholder to indicate agent exists but is disabled
export const rustDocsAgentDisabled = {
  name: "Rust Docs Agent",
  status: "disabled",
  reason:
    "Agent is commented out for production - only tools are needed in MCP server",
};
