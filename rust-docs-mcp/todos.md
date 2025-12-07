# Rust Docs MCP - TODOs

[← Back to Index](./index.md)

---

## ✅ COMPLETED: Core Implementation

All core functionality is now complete! The MCP server is fully functional with:
- 4 working tools (search_crates, get_crate_overview, get_item_docs, list_modules)
- MCP Resources for common Rust patterns
- MCP Prompts for guided Rust development tasks
- Clean Markdown output with Turndown conversion
- In-memory caching system

## 🎯 HIGH PRIORITY ENHANCEMENTS

These features will significantly improve the MCP's usefulness:

### 1. Code Examples Extraction
**Status**: Not started  
**Priority**: High  
**Estimated effort**: Medium

Enhance parsers to separately extract and categorize code examples:

```typescript
interface ItemDocs {
  // ... existing fields
  examples: CodeExample[]
}

interface CodeExample {
  title?: string
  code: string
  language: string
}

## Phase 3: Tool Implementation

### src/mastra/tools/search-crates.ts

- [x] Create `searchCratesTool` with createTool
- [x] Implement input schema (query, limit)
- [x] Implement output schema (crates array)
- [x] Connect to crates-io client

### src/mastra/tools/get-crate-overview.ts


**Files to modify**:
- `src/mastra/lib/parsers-turndown.ts`: Add code example extraction
- Tool schemas: Add `examples` field to output
- `src/mastra/tools/get-item-docs-turndown.ts`: Return examples separately

**Benefits**: AI can see code examples directly without parsing markdown

---

### 2. Better Error Messages
**Status**: Not started  
**Priority**: High  
**Estimated effort**: Small

Improve get_item_docs error handling:

**Current behavior**: Returns 404 or "item not found" for module path issues  
**Desired behavior**: 
- Detect when item is in a module (not root)
- Suggest using list_modules to find correct path
- Parse URL to suggest likely module location

**Files to modify**:
- `src/mastra/tools/get-item-docs-turndown.ts`: Enhanced error handling
- `src/mastra/lib/parsers-turndown.ts`: Add error detection helpers

**Benefits**: Saves time debugging module path issues

---

### 3. Trait Implementation Extraction
**Status**: Not started  
**Priority**: Medium  
**Estimated effort**: Medium

Extract trait implementations for structs/enums:

```typescript
interface ItemDocs {
  // ... existing fields
  implementations: {
    trait_name: string
    methods: MethodInfo[]
  }[]
}
```

**Files to modify**:
- `src/mastra/lib/parsers-turndown.ts`: Parse implementation blocks
- Tool schemas: Add implementations field

**Benefits**: See what traits a type implements and their methods

---

## 📊 MEDIUM PRIORITY FEATURES

### 4. Feature Flags Parsing
**Status**: Not started  
**Priority**: Medium  
**Estimated effort**: Small

Complete feature flags extraction in parsers.

**Files to modify**:
- `src/mastra/lib/parsers-turndown.ts`: Complete getCrateFeatures()

---

### 5. Rate Limiting for crates.io
**Status**: Not started  
**Priority**: Medium  
**Estimated effort**: Small

Add rate limit handling for crates.io API.

**Files to modify**:
- `src/mastra/lib/crates-io.ts`: Add retry logic and rate limit detection

---

## 🔧 LOW PRIORITY IMPROVEMENTS

### 6. Cache Persistence
**Status**: Not started  
**Priority**: Low  
**Estimated effort**: Medium

Move from in-memory to persistent cache (Redis/file system).

---

### 7. Versioned Documentation
**Status**: Not started  
**Priority**: Low  
**Estimated effort**: Small

Support fetching docs for specific Rust versions (currently always latest).

---

## ✅ RECENTLY COMPLETED (Dec 6, 2024)

### Resources - REMOVED (Dec 6, 2024)
**Status**: ✅ Removed

The earlier static resource bundle that contained curated Rust patterns was removed to maintain a dynamic-first approach. Hardcoded resources were replaced with:
- Updated prompts guiding workflows and tool usage for dynamic retrieval (get_item_docs, get_crate_overview, list_modules)
- Emphasis on using the docs.rs-driven tools to ensure always up-to-date docs

**Rationale**: Static resources can become outdated; dynamic tool-driven retrieval ensures the MCP always provides current documentation.

**Note**: If you want to keep curated patterns for offline scenarios, consider adding them as optional resource templates behind a feature flag. Currently the MCP prioritizes live docs.

---

### MCP Prompts Implementation  
**Status**: ✅ Complete

Created `src/mastra/prompts/rust-prompts.ts` with 6 task templates:
- implement-trait: Guide for implementing traits
- add-async-support: Convert sync to async
- handle-errors-idiomatically: Add error handling
- add-send-sync-bounds: Add thread safety bounds
- fix-lifetime-errors: Fix lifetime issues
- optimize-for-performance: Performance optimization

Each prompt includes:
- Argument schema
- Contextualized message templates
- Task-specific guidance

**Integration**: Wired into MCPServer in `src/mastra/index.ts`

---

### Documentation Consolidation
**Status**: ✅ Complete

- Moved all analysis from ANALYSIS_SUMMARY.md into analysis.md
- Deleted ANALYSIS_SUMMARY.md
- Added Quick Reference section to analysis.md
- All documentation now in rust-docs-mcp/ folder

---

### Build Verification
**Status**: ✅ Complete

- Ran `bun run build` successfully
- No TypeScript compilation errors
- All imports resolved correctly
- Resources and Prompts integrated with MCPServer

---

## 📝 TESTING CHECKLIST

When implementing enhancements, test with:

1. **Code Examples Extraction**
   - [ ] Get tokio::spawn docs
   - [ ] Verify examples are in separate field
   - [ ] Check example formatting

2. **Error Messages**
   - [ ] Try get_item_docs with wrong module path
   - [ ] Verify helpful error message
   - [ ] Check suggested fixes

3. **Trait Implementations**
   - [ ] Get AppHandle docs (has many trait impls)
   - [ ] Verify implementations extracted
   - [ ] Check method signatures

4. **MCP Resources** ✅
   - [x] List resources via MCP client
   - [x] Fetch pattern content
   - [x] Verify markdown formatting

5. **MCP Prompts** ✅
   - [x] List prompts via MCP client  
   - [x] Get prompt with arguments
   - [x] Verify message templates

---

## 🎯 NEXT ACTIONS

**Immediate next steps** (in priority order):

1. **Extract Code Examples** - Highest value, moderate effort
2. **Better Error Messages** - High value, low effort  
3. **Test Resources & Prompts** - Verify new features work in MCP client
4. **Trait Implementations** - Medium value, medium effort
5. **Feature Flags** - Low value, low effort

**Recommended approach**: Start with #1 (code examples) for maximum impact.

---

## 📚 REFERENCE

- See [analysis.md](./analysis.md) for comprehensive MCP evaluation
- See [index.md](./index.md) for project overview
- See [notes.md](./notes.md) for development notes

---

*Last updated: Dec 6, 2024*
  
- [ ] **Improve Error Messages**
  - [ ] When item not found, suggest using `list_modules`
  - [ ] Parse 404 pages to suggest likely module paths
  - [ ] Add helpful context to all error messages

-- [ ] **Add MCP Resources** (Common Rust Patterns) — *DEPRECATED*
   The team removed hardcoded resources. If a curated resource set is still desired, implement it behind a feature flag so it can be switched off.
  - [ ] Resource: Async patterns (spawn, select, join)
  - [ ] Resource: Error handling (Result, ?, thiserror)
  - [ ] Resource: Ownership patterns (Rc, Arc, RefCell)
  - [ ] Resource: Common trait bounds (Send, Sync, 'static)

### Medium Priority - Do Soon 📅

- [ ] **Add MCP Prompts** (Task Templates)
  - [ ] Prompt: "Implement {trait} for {type}"
  - [ ] Prompt: "Add async support to {function}"
  - [ ] Prompt: "Handle errors idiomatically"
  - [ ] Prompt: "Add Send/Sync bounds where needed"

- [ ] **Trait Implementation Extraction**
  - [ ] Parse "Implementations" section
  - [ ] Show what traits a type implements
  - [ ] Link to trait documentation

- [ ] **Complete Feature Flags**
  - [ ] Finish parsing from crate overview
  - [ ] Include feature descriptions
  - [ ] Show feature dependencies

### Low Priority - Do Eventually 🔮

- [ ] **Related Items Tracking**
  - [ ] Find related types/traits/functions
  - [ ] Show "frequently used together"
  - [ ] Build semantic relationships

- [ ] **Type Relationship Mapping**
  - [ ] Show trait hierarchy
  - [ ] Display type dependencies
  - [ ] Visualize module structure

- [ ] **Version Comparison**
  - [ ] Track breaking changes between versions
  - [ ] Show deprecations
  - [ ] Migration guides

- [ ] **Performance Improvements**
  - [ ] Add persistent caching (Redis/KV)
  - [ ] Implement rate limiting
  - [ ] Optimize HTML parsing
- [x] Verify caching works

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
