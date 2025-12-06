/**
 * Search crates on crates.io
 * Tool for finding Rust crates by name or keywords
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { searchCrates } from "../lib/crates-io";

export const searchCratesTool = createTool({
  id: "search_crates",
  description:
    "Search for Rust crates on crates.io by name or keywords. Returns a list of matching crates with their names, descriptions, versions, and download counts.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "Search terms for crate discovery (e.g., 'web framework', 'serde', 'async runtime')"
      ),
    limit: z
      .number()
      .optional()
      .default(10)
      .describe("Maximum number of results to return (default: 10)"),
  }),
  outputSchema: z.object({
    crates: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        version: z.string(),
        downloads: z.number(),
        documentation: z.string().nullable(),
        repository: z.string().nullable(),
        keywords: z.array(z.string()),
      })
    ),
    total: z.number(),
  }),
  execute: async ({ context }) => {
    try {
      const crates = await searchCrates(context.query, context.limit);

      return {
        crates: crates.map((crate) => ({
          name: crate.name,
          description: crate.description,
          version: crate.version,
          downloads: crate.downloads,
          documentation: crate.documentation,
          repository: crate.repository,
          keywords: crate.keywords,
        })),
        total: crates.length,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to search crates: ${message}`);
    }
  },
});
