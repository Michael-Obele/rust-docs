/**
 * Get crate overview from docs.rs using Turndown
 * Tool for fetching the main documentation page of a Rust crate as Markdown
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getCached, CACHE_TTL } from "../lib/cache";
import {
  parseCrateOverviewMarkdown,
  isNotFoundPage,
} from "../lib/parsers-turndown";

export const getCrateOverviewToolTurndown = createTool({
  id: "get_crate_overview_turndown",
  description:
    "Get the main documentation page for a Rust crate from docs.rs as Markdown. Returns the full crate documentation converted to readable Markdown format.",
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
    markdown: z.string(),
    url: z.string(),
  }),
  execute: async ({ context }) => {
    const { crate, version } = context;
    const cacheKey = `crate-overview-markdown:${crate}:${version}`;

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

        return parseCrateOverviewMarkdown(html, crate, version, url);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to get crate overview for '${crate}': ${message}`
      );
    }
  },
});
