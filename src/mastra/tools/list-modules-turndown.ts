/**
 * List modules and items in a crate or module using Turndown
 * Tool for exploring the structure of a Rust crate as Markdown
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getCached, CACHE_TTL } from "../lib/cache";
import {
  parseModuleItemsMarkdown,
  isNotFoundPage,
} from "../lib/parsers-turndown";

export const listModulesToolTurndown = createTool({
  id: "list_modules_turndown",
  description:
    "List all modules and items in a Rust crate or specific module from docs.rs as Markdown. Returns the full module documentation converted to readable Markdown format.",
  inputSchema: z.object({
    crate: z.string().describe("Crate name (e.g., 'tauri', 'serde', 'tokio')"),
    version: z
      .string()
      .optional()
      .default("latest")
      .describe("Crate version (default: 'latest')"),
    module: z
      .string()
      .optional()
      .describe(
        "Module path to explore (e.g., 'async_runtime', 'window/plugin'). If not provided, lists the crate root."
      ),
  }),
  outputSchema: z.object({
    markdown: z.string(),
    url: z.string(),
  }),
  execute: async ({ context }) => {
    const { crate, version, module } = context;
    const cacheKey = `module-items-markdown:${crate}:${version}:${module || "root"}`;

    try {
      const ttl =
        version === "latest"
          ? CACHE_TTL.MODULE_LISTING_LATEST
          : CACHE_TTL.MODULE_LISTING;
      return await getCached(cacheKey, ttl, async () => {
        // Crate path uses underscores instead of hyphens
        const cratePath = crate.replace(/-/g, "_");
        const modulePath = module ? `${module.replace(/-/g, "_")}/` : "";
        const url = `https://docs.rs/${crate}/${version}/${cratePath}/${modulePath}`;

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
            `Module '${module || "root"}' not found in crate '${crate}'`
          );
        }

        return parseModuleItemsMarkdown(html, url);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to list modules for '${crate}': ${message}`);
    }
  },
});
