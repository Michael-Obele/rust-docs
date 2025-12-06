# Rust Docs MCP - TODOs

[← Back to Index](./index.md)

---

## Phase 1: Project Setup

- [ ] Create new project directory
- [ ] Initialize with `bun init`
- [ ] Install dependencies:
  - [ ] `@mastra/core`
  - [ ] `@mastra/mcp`
  - [ ] `zod`
  - [ ] `cheerio`
- [ ] Configure TypeScript
- [ ] Create Mastra directory structure:
  - [ ] `src/mastra/tools/`
  - [ ] `src/mastra/lib/`
  - [ ] `src/mastra/index.ts`

## Phase 2: Library Implementation

### HTML Parsers (src/mastra/lib/parsers.ts)

- [ ] Create `parseCrateOverview(html)` function
  - [ ] Extract crate description
  - [ ] Extract modules list
  - [ ] Extract structs/enums/traits/functions/macros
  - [ ] Extract feature flags
- [ ] Create `parseItemDocs(html, type)` function
  - [ ] Extract item signature
  - [ ] Extract description
  - [ ] Extract methods (for structs/enums/traits)
  - [ ] Extract variants (for enums)
  - [ ] Extract examples
- [ ] Create `parseModuleItems(html)` function
  - [ ] Extract all item types and names

### crates.io Client (src/mastra/lib/crates-io.ts)

- [ ] Create `searchCrates(query, limit)` function
- [ ] Parse API response into structured format
- [ ] Handle rate limiting

### Caching (src/mastra/lib/cache.ts)

- [ ] Implement in-memory cache with TTL
- [ ] Create `getCached(key, ttl, fetcher)` helper

## Phase 3: Tool Implementation

### src/mastra/tools/search-crates.ts

- [ ] Create `searchCratesTool` with createTool
- [ ] Implement input schema (query, limit)
- [ ] Implement output schema (crates array)
- [ ] Connect to crates-io client

### src/mastra/tools/get-crate-overview.ts

- [ ] Create `getCrateOverviewTool` with createTool
- [ ] Implement input schema (crate, version)
- [ ] Implement output schema (overview data)
- [ ] Handle crate path transformation (- to \_)
- [ ] Connect to parser

### src/mastra/tools/get-item-docs.ts

- [ ] Create `getItemDocsTool` with createTool
- [ ] Implement input schema (crate, item_type, item_name, module)
- [ ] Implement output schema (item documentation)
- [ ] Handle all item types (struct, enum, trait, fn, macro, type)
- [ ] Connect to parser

### src/mastra/tools/list-modules.ts

- [ ] Create `listModulesTool` with createTool
- [ ] Implement input schema (crate, module)
- [ ] Implement output schema (categorized items)
- [ ] Connect to parser

## Phase 4: Mastra App Setup

### src/mastra/index.ts

- [ ] Import all tools
- [ ] Create MCPServer instance with all 4 tools
- [ ] Create Mastra instance with MCPServer
- [ ] Export mastra instance

## Phase 5: Local Testing

- [ ] Run `bun run dev` (mastra dev)
- [ ] Test in Mastra Studio UI
- [ ] Test each tool:
  - [ ] `search_crates` - Search for "serde"
  - [ ] `get_crate_overview` - Get tauri overview
  - [ ] `get_item_docs` - Get tauri::AppHandle docs
  - [ ] `list_modules` - List tauri modules
- [ ] Verify caching works

## Phase 6: Mastra Cloud Deployment

- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Sign up for Mastra Cloud
- [ ] Connect GitHub repository
- [ ] Configure project:
  - [ ] Set project name
  - [ ] Verify Mastra directory detection
- [ ] Deploy to Mastra Cloud
- [ ] Note HTTP/SSE endpoint URLs

## Phase 7: Verification

- [ ] Test HTTP endpoint with MCP client
- [ ] Test SSE endpoint with MCP client
- [ ] Verify IDE configuration snippets:
  - [ ] Cursor
  - [ ] VS Code
  - [ ] Windsurf
- [ ] Test with Claude Desktop (HTTP mode)

## Phase 8: Documentation

- [ ] Create comprehensive README.md
  - [ ] Project description
  - [ ] Quick start with HTTP endpoint
  - [ ] All 4 tools documented
  - [ ] Example queries
- [ ] Add usage examples:
  - [ ] Claude Desktop configuration
  - [ ] Cursor configuration
  - [ ] VS Code configuration
- [ ] Document companion MCP (tauri-docs-mcp)

---

## Future Enhancements (Post-MVP)

- [ ] Add `get_source_code` tool for viewing implementation
- [ ] Add `get_crate_features` tool for feature flag details
- [ ] Add `get_crate_versions` tool for version history
- [ ] Add semantic search with embeddings
- [ ] Support for nightly/beta documentation
- [ ] Cache warming for popular crates

---

## Blockers / Questions

- [ ] Confirm Mastra Cloud project URL format
- [ ] Decide on caching strategy for cloud deployment
- [ ] Consider rate limiting for docs.rs/crates.io

---

## Dependencies List

```json
{
  "dependencies": {
    "@mastra/core": "latest",
    "@mastra/mcp": "latest",
    "zod": "^3.23.0",
    "cheerio": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^22.0.0"
  }
}
```
