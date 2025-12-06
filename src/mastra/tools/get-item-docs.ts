/**
 * Get item documentation from docs.rs
 * Tool for fetching documentation for specific Rust items (structs, enums, traits, etc.)
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getCached, CACHE_TTL } from "../lib/cache";
import { parseItemDocs, isNotFoundPage } from "../lib/parsers";

export const getItemDocsTool = createTool({
  id: "get_item_docs",
  description:
    "Get documentation for a specific Rust item (struct, enum, trait, function, macro, or type alias) from docs.rs. Returns the item signature, description, methods, variants (for enums), implementations, and examples.",
  inputSchema: z.object({
    crate: z.string().describe("Crate name (e.g., 'tauri', 'serde', 'tokio')"),
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
    signature: z.string(),
    description: z.string(),
    methods: z.array(z.string()),
    variants: z.array(z.string()),
    implementations: z.array(z.string()),
    examples: z.string(),
    url: z.string(),
  }),
  execute: async ({ context }) => {
    const { crate, item_type, item_name, module } = context;
    const cacheKey = `item-docs:${crate}:${module || ""}:${item_type}:${item_name}`;

    try {
      return await getCached(cacheKey, CACHE_TTL.ITEM_DOCS, async () => {
        // Crate path uses underscores instead of hyphens
        const cratePath = crate.replace(/-/g, "_");
        const modulePath = module ? `${module.replace(/-/g, "_")}/` : "";
        const url = `https://docs.rs/${crate}/latest/${cratePath}/${modulePath}${item_type}.${item_name}.html`;

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
          throw new Error(
            `Item '${item_name}' of type '${item_type}' not found in crate '${crate}'${
              module ? ` module '${module}'` : ""
            }`
          );
        }

        return parseItemDocs(html, { crate, item_type, item_name, module });
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to get item docs: ${message}`);
    }
  },
});
