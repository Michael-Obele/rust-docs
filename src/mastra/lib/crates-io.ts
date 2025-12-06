/**
 * crates.io API client
 * Documentation: https://crates.io/api
 */

import { getCached, CACHE_TTL } from "./cache";

/**
 * Crate metadata from crates.io API
 */
export interface CrateInfo {
  name: string;
  description: string;
  version: string;
  downloads: number;
  documentation: string | null;
  repository: string | null;
  homepage: string | null;
  keywords: string[];
  categories: string[];
}

/**
 * Raw crate response from crates.io API
 */
interface CratesApiCrate {
  name: string;
  description: string | null;
  max_version: string;
  downloads: number;
  documentation: string | null;
  repository: string | null;
  homepage: string | null;
  keywords: string[];
  categories: string[];
}

interface CratesApiResponse {
  crates: CratesApiCrate[];
}

const CRATES_IO_API = "https://crates.io/api/v1";

/**
 * Search for crates on crates.io
 * @param query - Search query
 * @param limit - Maximum number of results (default: 10)
 * @returns Array of crate info objects
 */
export async function searchCrates(
  query: string,
  limit: number = 10
): Promise<CrateInfo[]> {
  const cacheKey = `search:${query}:${limit}`;

  return getCached(cacheKey, CACHE_TTL.CRATE_SEARCH, async () => {
    const url = `${CRATES_IO_API}/crates?q=${encodeURIComponent(query)}&per_page=${limit}`;

    const response = await fetch(url, {
      headers: {
        // crates.io requires a user-agent
        "User-Agent":
          "rust-docs-mcp/1.0.0 (https://github.com/yourusername/rust-docs-mcp)",
      },
    });

    if (!response.ok) {
      throw new Error(
        `crates.io API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as CratesApiResponse;

    return data.crates.map((crate) => ({
      name: crate.name,
      description: crate.description ?? "",
      version: crate.max_version,
      downloads: crate.downloads,
      documentation: crate.documentation,
      repository: crate.repository,
      homepage: crate.homepage,
      keywords: crate.keywords ?? [],
      categories: crate.categories ?? [],
    }));
  });
}

/**
 * Get detailed information about a specific crate
 * @param crateName - Name of the crate
 * @returns Crate info or null if not found
 */
export async function getCrateInfo(
  crateName: string
): Promise<CrateInfo | null> {
  const cacheKey = `crate:${crateName}`;

  return getCached(cacheKey, CACHE_TTL.CRATE_OVERVIEW, async () => {
    const url = `${CRATES_IO_API}/crates/${encodeURIComponent(crateName)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "rust-docs-mcp/1.0.0 (https://github.com/yourusername/rust-docs-mcp)",
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(
        `crates.io API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const crate = data.crate as CratesApiCrate;

    return {
      name: crate.name,
      description: crate.description ?? "",
      version: crate.max_version,
      downloads: crate.downloads,
      documentation: crate.documentation,
      repository: crate.repository,
      homepage: crate.homepage,
      keywords: crate.keywords ?? [],
      categories: crate.categories ?? [],
    };
  });
}
