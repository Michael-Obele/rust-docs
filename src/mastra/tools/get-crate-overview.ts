/**
 * Get crate overview from docs.rs
 * Tool for fetching the main documentation page of a Rust crate
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getCached, CACHE_TTL } from "../lib/cache";
import { parseCrateOverview, isNotFoundPage } from "../lib/parsers";

export const getCrateOverviewTool = createTool({
  id: "get_crate_overview",
  description:
    "Get the main documentation page for a Rust crate from docs.rs. Returns the crate description, modules, structs, enums, traits, functions, and macros.",
  inputSchema: z.object({
    crate: z
      .string()
      .describe("Crate name (e.g., 'tauri', 'serde', 'tokio', 'actix-web')"),
    version: z
      .string()
      .optional()
      .default("latest")
      .describe("Crate version (default: 'latest')"),
  }),
  outputSchema: z.object({
    name: z.string(),
    version: z.string(),
    description: z.string(),
    modules: z.array(z.string()),
    structs: z.array(z.string()),
    enums: z.array(z.string()),
    traits: z.array(z.string()),
    functions: z.array(z.string()),
    macros: z.array(z.string()),
    types: z.array(z.string()),
    constants: z.array(z.string()),
    content: z.string(),
    url: z.string(),
  }),
  execute: async ({ context }) => {
    const { crate, version } = context;
    const cacheKey = `crate-overview:${crate}:${version}`;

    try {
      return await getCached(cacheKey, CACHE_TTL.CRATE_OVERVIEW, async () => {
        // Crate path uses underscores instead of hyphens
        const cratePath = crate.replace(/-/g, "_");
        const url = `https://docs.rs/${crate}/${version}/${cratePath}/`;

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
          throw new Error(`Crate '${crate}' not found on docs.rs`);
        }

        return parseCrateOverview(html, crate, version, url);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to get crate overview for '${crate}': ${message}`
      );
    }
  },
});
