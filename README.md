# rust-docs

[![latest release](https://img.shields.io/github/v/tag/Michael-Obele/rust-docs?sort=semver)](https://github.com/Michael-Obele/rust-docs/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Mastra MCP server providing access to Rust documentation from docs.rs.

## Production Deployments

> [!NOTE]
> This project is currently in development and has not been deployed to production yet. Deployment instructions will be added once available.

This repository contains a Mastra-based MCP server that provides access to Rust crate documentation from docs.rs. Use it in your AI-powered code editor to get instant access to the latest Rust documentation directly from the official Rust documentation site.

## 🎉 What's New

- ✅ Access to comprehensive Rust crate documentation from docs.rs
- ✅ Four main MCP tools for crate discovery, documentation retrieval, and search
- ✅ Intelligent caching for improved performance
- ✅ Support for all major AI code editors (Cursor, Windsurf, VS Code, Zed, Claude Code, Codex)
- ✅ HTTP and SSE transport protocols (once deployed)

## Editor Setup

Once deployed, this MCP server will support all major AI code editors. For now, you can run it locally during development.

<details>
<summary>Local Development Setup</summary>

1. Clone and setup the project locally
2. Run `npm run dev` to start the development server
3. Configure your editor to connect to the local MCP server

</details>

## CLI & Agent Configuration

Configuration examples will be provided once the server is deployed to production.

## Verification & Quick Tests

During local development:

- Run `npm run dev` to start the server
- Test the tools using your configured MCP client

## Available Tools

Once installed, your AI assistant will have access to these tools (IDs exactly as exposed by the MCP server):

1. `get_crate_overview` — Get the main documentation page for a Rust crate from docs.rs (returns crate description, modules, structs, enums, traits, functions, and macros)
2. `get_item_docs` — Get documentation for a specific Rust item (struct, enum, trait, function, macro, or type alias) from docs.rs
3. `list_modules` — List all modules and items in a Rust crate or specific module from docs.rs
4. `search_crates` — Search for Rust crates on crates.io by name or keywords

### Tool response formats (quick reference)

- `get_crate_overview`: Structured data with crate metadata and content
- `get_item_docs`: Detailed documentation for specific items
- `list_modules`: Categorized lists of modules, structs, enums, traits, functions, macros, type aliases, and constants
- `search_crates`: List of matching crates with names, descriptions, versions, and download counts

## Example Usage

After installing the MCP server in your editor, you can ask your AI assistant:

- "Show me the documentation for the serde crate"
- "Get the overview of the tokio crate"
- "List all modules in the actix-web crate"
- "Search for async runtime crates"
- "What are the methods available on the Vec struct?"
- "Find crates related to web frameworks"
- "Get documentation for the Serialize trait"

## Local Development

Want to run the MCP server locally or contribute to the project?

### Contents

- `src/` - Mastra bootstrap, MCP servers, tools, and agents
- `src/mastra/tools/` - Tools for accessing Rust documentation
- `src/mastra/lib/` - Caching, parsing, and utility functions

### Quick start (development smoke-test)

1. Install dependencies (using your preferred package manager).

```bash
# npm
npm install

# or bun
bun install

# or pnpm
pnpm install
```

2. Run the development smoke-test (recommended):

```bash
# Starts Mastra in dev mode; this repo's smoke-test expects a short run to detect runtime errors
npm run dev
```

## Useful scripts

- `npm run dev` - Start Mastra in development mode (recommended smoke-test).
- `npm run build` - Build the Mastra project for production.
- `npm run start` - Start the built Mastra server.
- `npm run check-versions` - Check if package.json and MCP server versions match.
- `npm run sync-versions-auto` - Auto-sync versions if they don't match (package.json is source of truth).
- `npm run sync-versions` - Sync versions from latest git tag to both files.

## Release Process

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and changelog generation based on conventional commits.

### How it works

1. **Conventional Commits**: All commits must follow the [conventional commit format](https://conventionalcommits.org/)
   - `feat:` for new features (minor version bump)
   - `fix:` for bug fixes (patch version bump)
   - `docs:`, `chore:`, `refactor:`, `style:`, `test:` for other changes (no version bump)

2. **Automated Releases**: When code is pushed to the `main` branch, semantic-release:
   - Analyzes commit messages
   - Determines the next version number
   - Updates `package.json` and `src/mastra/index.ts` with the new version
   - Generates/updates `CHANGELOG.md`
   - Creates a git tag and GitHub release

3. **Version Synchronization**: The version is maintained in two places:
   - `package.json` (source of truth)
   - `src/mastra/index.ts` (MCP server version)

### Manual Version Management

If you need to manually sync versions:

```bash
# Check if versions match
npm run check-versions

# Auto-sync versions (package.json is source of truth)
npm run sync-versions-auto

# Sync from latest git tag
npm run sync-versions
```

## MCP Architecture

This project exposes a **production-ready MCP Server** that makes Rust documentation available to AI code editors.

**What this means:**

- **MCP Server** (`src/mastra/index.ts`) - Exposes four Rust documentation tools to external MCP clients
- **No MCP Client needed** - This project only _provides_ tools, it doesn't consume tools from other servers

## Project Architecture

### Core Components

- **Mastra Framework**: Orchestrates agents, workflows, and MCP servers
- **MCP Server**: Exposes tools to AI code editors via HTTP/SSE protocols (once deployed)
- **Web Scraping Services**: Fetches documentation from docs.rs
- **Intelligent Caching**: Reduces API calls while ensuring freshness
- **Documentation Parsing**: Extracts structured information from HTML documentation

### Key Features

- **Real-time Documentation**: Fetches latest content from docs.rs
- **Comprehensive Coverage**: Access to crates, modules, structs, enums, traits, functions, macros, and types
- **Intelligent Caching**: Reduces API calls while ensuring freshness
- **Search Functionality**: Find crates by name or keywords
- **Structured Output**: Returns parsed, structured documentation data

## Conventions & notes

- Tools are implemented under `src/mastra/tools` and should use `zod` for input validation
- Web scraping uses cheerio and turndown for HTML to markdown conversion
- Intelligent caching is used to improve performance and reduce API calls
- Tools follow Mastra patterns using `createTool` with proper input/output schemas

## Development tips

- Node >= 22.13.0 is recommended (see `package.json` engines)
- When adding tools, follow the patterns in `src/mastra/tools/get-crate-overview.ts`
- After making changes, run the smoke-test via `npm run dev` to surface runtime integration issues early
- The system uses intelligent caching - clear cache if you need fresh data during development

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before getting started.

## Contact

- **Issues & Support**: [GitHub Issues](https://github.com/Michael-Obele/rust-docs/issues)
- **Maintainer**: Michael Obele

---

For more details:

- **Web scraping services**: See `src/mastra/lib/` for documentation fetching and parsing implementation


