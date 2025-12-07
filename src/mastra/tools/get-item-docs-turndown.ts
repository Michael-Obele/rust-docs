/**
 * Get item documentation from docs.rs using Turndown
 * Tool for fetching documentation for specific Rust items as Markdown
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getCached, CACHE_TTL } from "../lib/cache";
import { parseItemDocsMarkdown, isNotFoundPage } from "../lib/parsers-turndown";

export const getItemDocsToolTurndown = createTool({
  id: "get_item_docs_turndown",
  description:
    "Get documentation for a specific Rust item (struct, enum, trait, function, macro, or type alias) from docs.rs as Markdown. Returns the full item documentation converted to readable Markdown format.",
  inputSchema: z.object({
    crate: z.string().describe("Crate name (e.g., 'tauri', 'serde', 'tokio')"),
    version: z
      .string()
      .optional()
      .default("latest")
      .describe("Crate version (default: 'latest')"),
    item_type: z
      .enum(["struct", "enum", "trait", "fn", "macro", "type"])
      .describe(
        "Type of item: 'struct', 'enum', 'trait', 'fn' (function), 'macro', or 'type' (type alias)"
      ),
    item_name: z
      .string()
      .describe("Name of the item (e.g., 'AppHandle', 'Result', 'Serialize')"),
    module: z
      .string()
      .optional()
      .describe(
        "Module path if the item is not at the crate root (e.g., 'async_runtime' or 'window/plugin')"
      ),
  }),
  outputSchema: z.object({
    name: z.string(),
    type: z.string(),
    markdown: z.string(),
    url: z.string(),
  }),
  execute: async ({ context }) => {
    const { crate, version, item_type, item_name, module } = context;
    const cacheKey = `item-docs-markdown:${crate}:${version}:${module || ""}:${item_type}:${item_name}`;

    try {
      const ttl = version === "latest" ? CACHE_TTL.ITEM_DOCS_LATEST : CACHE_TTL.ITEM_DOCS;
      return await getCached(cacheKey, ttl, async () => {
        // Crate path uses underscores instead of hyphens
        const cratePath = crate.replace(/-/g, "_");
        const modulePath = module ? `${module}/` : "";
        const url = `https://docs.rs/${crate}/${version}/${cratePath}/${modulePath}${item_type}.${item_name}.html`;

        const response = await fetch(url, {
          headers: {
            "User-Agent": "rust-docs-mcp/1.0.0",
          },
        });

        if (!response.ok) {
          throw new Error(
            `docs.rs returned ${response.status}: ${response.statusText}`
          );
        }

        const html = await response.text();

        if (isNotFoundPage(html)) {
          // Include helpful debugging guidance
          const suggestion = `If this item exists, try using 'list_modules' tool to find its module path and re-call get_item_docs with module parameter`;
          throw new Error(`Item '${item_name}' not found in crate '${crate}'. ${suggestion}`);
        }

        return parseItemDocsMarkdown(html, {
          crate,
          item_type,
          item_name,
          module,
        });
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to get item docs for '${item_name}' in '${crate}': ${message}`
      );
    }
  },
});
