/**
 * List modules and items in a crate or module
 * Tool for exploring the structure of a Rust crate
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getCached, CACHE_TTL } from "../lib/cache";
import { parseModuleItems, isNotFoundPage } from "../lib/parsers";

export const listModulesTool = createTool({
  id: "list_modules",
  description:
    "List all modules and items in a Rust crate or specific module from docs.rs. Returns categorized lists of submodules, structs, enums, traits, functions, macros, type aliases, and constants.",
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
    const { crate, version, module } = context;
    const cacheKey = `module-items:${crate}:${version}:${module || "root"}`;

    try {
      const ttl = version === "latest" ? CACHE_TTL.MODULE_LISTING_LATEST : CACHE_TTL.MODULE_LISTING;
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
            `Crate '${crate}'${module ? ` module '${module}'` : ""} not found on docs.rs`
          );
        }

        return parseModuleItems(html, url);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to list modules: ${message}`);
    }
  },
});
