# rust-docs

[![latest release](https://img.shields.io/github/v/tag/Michael-Obele/rust-docs?sort=semver)](https://github.com/Michael-Obele/rust-docs/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Mastra MCP server providing access to Rust documentation from docs.rs.

## Production Deployments

Choose the base host that fits your workflow — both expose the same toolset, but their runtime characteristics differ:

| Host         | Base URL                                                          | Highlights                                                                                           |
| ------------ | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Mastra Cloud | [https://rust-docs.mastra.cloud](https://rust-docs.mastra.cloud/) | **Primary choice** - Zero cold start, maximum responsiveness, and consistently reliable performance. |

- Append `/api/mcp/rust-docs/sse` for the SSE transport (best for editors that keep long-lived connections).
- Append `/api/mcp/rust-docs/mcp` for the HTTP transport (handy for CLIs and quick one-off calls).
- **Mastra Cloud is the recommended primary deployment** - it offers zero cold start and maximum responsiveness.

Endpoint reference & alternates

- **Mastra Cloud SSE**: [https://rust-docs.mastra.cloud/api/mcp/rust-docs/sse](https://rust-docs.mastra.cloud/api/mcp/rust-docs/sse)
- **Mastra Cloud HTTP**: [https://rust-docs.mastra.cloud/api/mcp/rust-docs/mcp](https://rust-docs.mastra.cloud/api/mcp/rust-docs/mcp)

This repository contains a Mastra-based MCP server that provides access to Rust crate documentation from docs.rs. Use it in your AI-powered code editor to get instant access to the latest Rust documentation directly from the official Rust documentation site.

## 🎉 What's New

- ✅ Production deployment on Mastra Cloud
- ✅ Four main MCP tools for crate discovery, documentation retrieval, and search
- ✅ Intelligent caching for improved performance
- ✅ Support for all major AI code editors (Cursor, Windsurf, VS Code, Zed, Claude Code, Codex)
- ✅ HTTP and SSE transport protocols
- ✅ Real-time web scraping from docs.rs

## Editor Setup

**Mastra Cloud is the recommended primary deployment** for all editors. It offers zero cold start and maximum responsiveness. SSE works best for editors that keep a persistent connection, while HTTP is handy for one-off requests and scripts. VS Code users can open the Command Palette (`Cmd/Ctrl+Shift+P`) and run `MCP: Add server` to paste either URL.

Cursor

1. Open Cursor Settings (`Cmd/Ctrl` + `,`).
2. Navigate to "MCP" / "Model Context Protocol" and add a new server configuration.
3. **Mastra Cloud is recommended** for zero cold start and maximum responsiveness. Append the SSE or HTTP path as shown in the examples below.

Mastra Cloud — SSE example:

```
{
  "rust-docs": {
    "type": "sse",
    "url": "https://rust-docs.mastra.cloud/api/mcp/rust-docs/sse"
  }
}
```

Mastra Cloud — HTTP example:

```
{
  "rust-docs": {
    "type": "http",
    "url": "https://rust-docs.mastra.cloud/api/mcp/rust-docs/mcp"
  }
}
```

### Mastra Cloud is the recommended deployment for reliability and responsiveness.

Windsurf

1. Edit `~/.codeium/windsurf/mcp_config.json`.
2. **Mastra Cloud is recommended** for zero cold start and maximum responsiveness. Add the SSE transport as shown:

```
{
  "mcpServers": {
    "rust-docs": {
      "url": "https://rust-docs.mastra.cloud/api/mcp/rust-docs/sse",
      "transport": "sse"
    }
  }
}
```

3. Save, restart Windsurf, then open `mcp.json` in Agent mode and click "start".

Use the HTTP variant if you need it:

```
{
  "servers": {
    "rust-docs": {
      "type": "http",
      "url": "https://rust-docs.mastra.cloud/api/mcp/rust-docs/mcp"
    }
  }
}
```

Zed

1. Open Zed settings (`Cmd/Ctrl` + `,`).
2. Edit `~/.config/zed/settings.json` and add an entry under `context_servers`:

```
{
  "context_servers": {
    "rust-docs": {
      "source": "custom",
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://rust-docs.mastra.cloud/api/mcp/rust-docs/sse"
      ],
      "env": {}
    }
  }
}
```

4. Save, restart Zed, and confirm the server shows a green indicator in the Agent panel. Zed also offers a UI flow via Settings → Agent to paste either endpoint without editing JSON.

## CLI & Agent Configuration

The same base URLs work across CLIs. **Mastra Cloud is the recommended primary deployment** for the fastest responses with zero cold start.

Claude Code CLI (Anthropic)

- **Global settings** (`~/.claude/settings.json`):

```
{
    "mcpServers": {
      "rust-docs": {
        "command": "npx",
        "args": [
          "-y",
          "mcp-remote",
          "https://rust-docs.mastra.cloud/api/mcp/rust-docs/mcp"
        ]
      }
    }
}
```

- **Project-scoped override** (`.mcp.json`):

```
{
    "mcpServers": {
      "rust-docs": {
        "command": "npx",
        "args": [
          "-y",
          "mcp-remote",
          "https://rust-docs.mastra.cloud/api/mcp/rust-docs/mcp"
        ]
      }
    }
}
```

Enable project servers with:

```
{
    "enableAllProjectMcpServers": true
}
```

- **Command palette alternative:**

```
claude mcp add rust-docs --url https://rust-docs.mastra.cloud/api/mcp/rust-docs/mcp
```

- Use `/permissions` inside Claude Code to grant tool access if prompted.

OpenAI Codex CLI

Register the Mastra Cloud endpoint for codex or use your own privately hosted MCP endpoint.

```
codex mcp add rust-docs --url https://rust-docs.mastra.cloud/api/mcp/rust-docs/sse
codex mcp list
```

Gemini CLI (Google)

1. Create or edit `~/.gemini/settings.json`:

```
mkdir -p ~/.gemini
nano ~/.gemini/settings.json
```

2. Add a configuration. Mastra Cloud example:

```
{
     "mcpServers": {
       "rust-docs": {
         "httpUrl": "https://rust-docs.mastra.cloud/api/mcp/rust-docs/mcp"
       }
     }
}
```

3. Prefer the `npx mcp-remote` command variant if your CLI version expects a command:

```
{
     "mcpServers": {
       "rust-docs": {
         "command": "npx",
         "args": [
           "mcp-remote",
           "https://rust-docs.mastra.cloud/api/mcp/rust-docs/mcp"
         ]
       }
     }
}
```

4. **Mastra Cloud is recommended** for zero cold start and maximum responsiveness. Restart the CLI to apply changes.

## Verification & Quick Tests

- `claude mcp list`
- `codex mcp list`
- `npx mcp-remote https://rust-docs.mastra.cloud/api/mcp/rust-docs/mcp`
- `curl -I https://rust-docs.mastra.cloud/api/mcp/rust-docs/mcp`
- `curl -N https://rust-docs.mastra.cloud/api/mcp/rust-docs/sse`

Claude Code may prompt for tool permissions — use `/permissions` or set `allowedTools` in `~/.claude.json`. Editors that maintain long-lived connections should use the SSE URL; quick scripts can stick with HTTP.

## Available Tools

Once installed, your AI assistant will have access to these tools (IDs exactly as exposed by the MCP server):

1. `search_crates` — Search for Rust crates on crates.io by name or keywords
2. `get_crate_overview` — Get the main documentation page for a Rust crate from docs.rs as Markdown
3. `get_item_docs` — Get documentation for a specific Rust item as Markdown
4. `list_modules` — List all modules and items in a Rust crate or specific module as Markdown

### Tool response formats (quick reference)

- `search_crates`: List of matching crates with names, descriptions, versions, and download counts
- `get_crate_overview`: Markdown documentation for the crate overview
- `get_item_docs`: Markdown documentation for specific items (structs, enums, traits, functions, macros)
- `list_modules`: Markdown list of all modules and items in a crate or module

## Example Usage

After installing the MCP server in your editor, you can ask your AI assistant:

- "Show me the documentation for the serde crate"
- "Get the overview of the tokio crate"
- "List all modules in the actix-web crate"
- "Search for async runtime crates"
- "What are the methods available on the Vec struct?"
- "Find crates related to web frameworks"
- "Get documentation for the Serialize trait"
- "Search for crates with 'http' in the name"
- "Show me the tokio::fs module documentation"

## Local Development

Want to run the MCP server locally or contribute to the project?

### Contents

- `src/` - Mastra bootstrap, MCP servers, tools, and agents
- `src/mastra/tools/` - Tools for accessing Rust documentation
- `src/mastra/lib/` - Caching, parsing, and utility functions
- `scripts/` - Version management and automation scripts

### Quick start (development smoke-test)

1. Install dependencies (using your preferred package manager).

```
# npm
npm install

# or bun
bun install

# or pnpm
pnpm install
```

2. Run the development smoke-test (recommended):

```
# Starts Mastra in dev mode; this repo's smoke-test expects a short run to detect runtime errors
npm run dev
```

## Useful scripts

- `npm run dev` - Start Mastra in development mode (recommended smoke-test).
- `npm run build` - Build the Mastra project for production.
- `npm run start` - Start the built Mastra server.
- `npm run check-versions` - Check if package.json and mcp-server.ts versions match (fails if mismatched).
- `npm run sync-versions-auto` - Check versions and auto-sync if mismatched (package.json is source of truth).
- `npm run sync-versions` - Sync versions from latest git tag to both files.

## MCP Architecture

This project exposes a **production-ready MCP Server** that makes Rust documentation available to AI code editors.

**What this means:**

- **MCP Server** (`src/mastra/index.ts`) - Exposes four Rust documentation tools to external MCP clients (Cursor, Windsurf, VS Code, etc.)
- **No MCP Client needed** - This project only _provides_ tools, it doesn't consume tools from other servers

The server is deployed at `https://rust-docs.mastra.cloud` and exposes tools via HTTP and SSE transports.

## Project Architecture

### Core Components

- **Mastra Framework**: Orchestrates agents, workflows, and MCP servers
- **MCP Server**: Exposes tools to AI code editors via HTTP/SSE protocols
- **Web Scraping Services**: Fetches documentation from docs.rs and crates.io
- **Intelligent Caching**: Reduces API calls while ensuring freshness
- **Documentation Parsing**: Extracts structured information from HTML documentation

### Key Features

- **Real-time Documentation**: Always fetches latest content from docs.rs
- **Comprehensive Coverage**: Access to crates, modules, structs, enums, traits, functions, macros, and types
- **Intelligent Caching**: Reduces API calls while ensuring freshness
- **Search Functionality**: Find crates by name or keywords on crates.io
- **Markdown Output**: Returns parsed documentation as clean Markdown

## Conventions & notes

- Tools are implemented under `src/mastra/tools` and should use `zod` for input validation
- Web scraping uses cheerio and turndown for HTML to markdown conversion
- Intelligent caching is used to improve performance and reduce API calls
- Tools follow Mastra patterns using `createTool` with proper input/output schemas

## Development tips

- Node >= 22.13.0 is recommended (see `package.json` engines)
- When adding tools, follow the patterns in `src/mastra/tools/get-crate-overview-turndown.ts`
- After making changes, run the 10–15s smoke-test via `npm run dev` to surface runtime integration issues early
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
