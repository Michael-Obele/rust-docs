/**
 * In-memory cache with TTL (Time-To-Live) support
 * Used to reduce repeated fetches to docs.rs and crates.io
 */

interface CacheEntry<T> {
  data: T;
  expires: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Cache TTL values in milliseconds
 *
 * Rationale:
 * - Versioned docs (specific version): 24 hours - immutable once published
 * - Latest version: 2 hours - changes when new version released
 * - Search: 30 minutes - new crates published frequently
 */
export const CACHE_TTL = {
  CRATE_SEARCH: 30 * 60 * 1000, // 30 minutes - new crates published
  CRATE_OVERVIEW: 24 * 60 * 60 * 1000, // 24 hours - versioned docs are immutable
  CRATE_OVERVIEW_LATEST: 2 * 60 * 60 * 1000, // 2 hours - 'latest' can change on new releases
  ITEM_DOCS: 24 * 60 * 60 * 1000, // 24 hours - versioned item docs are immutable
  ITEM_DOCS_LATEST: 2 * 60 * 60 * 1000, // 2 hours - latest item docs
  MODULE_LISTING: 24 * 60 * 60 * 1000, // 24 hours - versioned module listings
  MODULE_LISTING_LATEST: 2 * 60 * 60 * 1000, // 2 hours - latest module listing TTL
} as const;

/**
 * Get cached data or fetch and cache new data
 * @param key - Unique cache key
 * @param ttlMs - Time-to-live in milliseconds
 * @param fetcher - Async function to fetch data if not cached
 * @returns Cached or freshly fetched data
 */
export async function getCached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);

  if (cached && cached.expires > Date.now()) {
    return cached.data as T;
  }

  const data = await fetcher();
  cache.set(key, { data, expires: Date.now() + ttlMs });
  return data;
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Remove a specific key from cache
 */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}
