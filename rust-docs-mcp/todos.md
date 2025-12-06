# Rust Docs MCP - TODOs

[← Back to Index](./index.md)

---

## Phase 1: Project Setup

- [x] Create new project directory
- [x] Initialize with `bun init`
- [x] Install dependencies:
  - [x] `@mastra/core`
  - [x] `@mastra/mcp`
  - [x] `zod`
  - [x] `cheerio`
- [x] Configure TypeScript
- [x] Create Mastra directory structure:
  - [x] `src/mastra/tools/`
  - [x] `src/mastra/lib/`
  - [x] `src/mastra/index.ts`

## Phase 2: Library Implementation

### HTML Parsers (src/mastra/lib/parsers.ts)

- [x] Create `parseCrateOverview(html)` function
  - [x] Extract crate description
  - [x] Extract modules list
  - [x] Extract structs/enums/traits/functions/macros
  - [ ] Extract feature flags
- [x] Create `parseItemDocs(html, type)` function
  - [x] Extract item signature
  - [x] Extract description
  - [x] Extract methods (for structs/enums/traits)
  - [x] Extract variants (for enums)
  - [x] Extract examples
- [x] Create `parseModuleItems(html)` function
  - [x] Extract all item types and names

### crates.io Client (src/mastra/lib/crates-io.ts)

- [x] Create `searchCrates(query, limit)` function
- [x] Parse API response into structured format
- [ ] Handle rate limiting

### Caching (src/mastra/lib/cache.ts)

- [x] Implement in-memory cache with TTL
- [x] Create `getCached(key, ttl, fetcher)` helper

## Phase 3: Tool Implementation

### src/mastra/tools/search-crates.ts

- [x] Create `searchCratesTool` with createTool
- [x] Implement input schema (query, limit)
- [x] Implement output schema (crates array)
- [x] Connect to crates-io client

### src/mastra/tools/get-crate-overview.ts

- [x] Create `getCrateOverviewTool` with createTool
- [x] Implement input schema (crate, version)
- [x] Implement output schema (overview data)
- [x] Handle crate path transformation (- to \_)
- [x] Connect to parser

### src/mastra/tools/get-item-docs.ts

- [x] Create `getItemDocsTool` with createTool
- [x] Implement input schema (crate, item_type, item_name, module)
- [x] Implement output schema (item documentation)
- [x] Handle all item types (struct, enum, trait, fn, macro, type)
- [x] Connect to parser

### src/mastra/tools/list-modules.ts

- [x] Create `listModulesTool` with createTool
- [x] Implement input schema (crate, module)
- [x] Implement output schema (categorized items)
- [x] Connect to parser

## Phase 4: Mastra App Setup

### src/mastra/index.ts

- [x] Import all tools
- [x] Create MCPServer instance with all 4 tools
- [x] Create Mastra instance with MCPServer
- [x] Export mastra instance

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
