/**
 * MCP Prompts for common Rust development tasks
 * Provides reusable templates to guide AI through common Rust scenarios
 */

import type { Prompt, PromptMessage } from "@modelcontextprotocol/sdk/types.js";

/**
 * Common Rust task prompts exposed as MCP Prompts
 */
export const rustPrompts: Prompt[] = [
  {
    name: "implement-trait",
    description: "Guide for implementing a trait for a type",
    arguments: [
      {
        name: "trait_name",
        description: "Name of the trait to implement",
        required: true,
      },
      {
        name: "type_name",
        description: "Name of the type implementing the trait",
        required: true,
      },
      {
        name: "crate_name",
        description: "Crate containing the trait (e.g., 'std', 'serde')",
        required: false,
      },
      {
        name: "version",
        description:
          "Optional crate version to use when querying documentation (default: 'latest')",
        required: false,
      },
    ],
  },
  {
    name: "add-async-support",
    description: "Guide for adding async support to a function",
    arguments: [
      {
        name: "function_code",
        description: "Current synchronous function code",
        required: true,
      },
      {
        name: "runtime",
        description: "Async runtime to use (tokio, async-std)",
        required: false,
      },
      {
        name: "version",
        description:
          "Optional crate/runtime version to use when querying documentation (default: 'latest')",
        required: false,
      },
    ],
  },
  {
    name: "handle-errors-idiomatically",
    description: "Guide for idiomatic error handling in Rust",
    arguments: [
      {
        name: "code",
        description: "Code that needs error handling",
        required: true,
      },
      {
        name: "error_strategy",
        description: "Error handling strategy (Result, thiserror, anyhow)",
        required: false,
      },
      {
        name: "version",
        description:
          "Optional crate version to use for documentation queries (default: 'latest')",
        required: false,
      },
    ],
  },
  {
    name: "add-send-sync-bounds",
    description: "Guide for adding Send/Sync trait bounds",
    arguments: [
      {
        name: "code",
        description: "Code needing Send/Sync bounds",
        required: true,
      },
      {
        name: "use_case",
        description: "Use case (threading, async, both)",
        required: false,
      },
      {
        name: "version",
        description:
          "Optional crate version if documentation should be a specific version",
        required: false,
      },
    ],
  },
  {
    name: "fix-lifetime-errors",
    description: "Guide for fixing lifetime-related compiler errors",
    arguments: [
      {
        name: "error_message",
        description: "Compiler error message about lifetimes",
        required: true,
      },
      {
        name: "code",
        description: "Code with lifetime issues",
        required: false,
      },
      {
        name: "version",
        description:
          "Optional crate version for documentation lookups useful during debugging",
        required: false,
      },
    ],
  },
  {
    name: "optimize-for-performance",
    description: "Guide for optimizing Rust code for performance",
    arguments: [
      {
        name: "code",
        description: "Code to optimize",
        required: true,
      },
      {
        name: "bottleneck",
        description: "Known performance bottleneck",
        required: false,
      },
      {
        name: "version",
        description:
          "Optional crate version used when consulting docs for performance patterns",
        required: false,
      },
    ],
  },
];

/**
 * Get prompt messages for a specific Rust task
 */
export async function getRustPromptMessages({
  name,
  args,
}: {
  name: string;
  args?: Record<string, string>;
}): Promise<{ prompt: Prompt; messages: PromptMessage[] }> {
  const prompt = rustPrompts.find((p) => p.name === name);
  if (!prompt) {
    throw new Error(`Prompt not found: ${name}`);
  }

  switch (name) {
    case "implement-trait": {
      const traitName = args?.trait_name || "Trait";
      const typeName = args?.type_name || "MyType";
      const crateName = args?.crate_name || "the documentation";
      const version = args?.version || "latest";

      return {
        prompt,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I need to implement the ${traitName} trait for ${typeName}.

**IMPORTANT: Use the MCP tools to get up-to-date documentation. DO NOT rely on training data.**

Follow this workflow:

1. **Query the documentation** (REQUIRED):
  - Use the 'get_item_docs' tool to fetch ${traitName} trait documentation from ${crateName}
  - If the item isn't found at the crate root, use the 'list_modules' tool to locate the module that contains it and re-call 'get_item_docs' with the correct module path
  - Parameters: { crate: "${crateName}", version: "${version}", item_type: "trait", item_name: "${traitName}" }
   - This gives you: required methods, trait bounds, and current API

2. **Analyze what you found**:
   - What methods need to be implemented?
   - What trait bounds are required?
   - Are there any associated types?

3. **Provide implementation**:
   - Implement all required methods based on docs
   - Add proper error handling if needed
   - Follow patterns from the documentation
   - Include helpful comments

4. **Explain your implementation**:
   - Why this approach is idiomatic
   - Any trade-offs made
   - Common mistakes to avoid

**Start by querying the trait documentation using the get_item_docs tool.**`,
            },
          },
        ],
      };
    }

    case "add-async-support": {
      const code = args?.function_code || "fn example() {}";
      const runtime = args?.runtime || "tokio";
      const version = args?.version || "latest";

      return {
        prompt,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I need to convert this synchronous function to async using ${runtime}:

\`\`\`rust
${code}
\`\`\`

**IMPORTANT: Use MCP tools to get current ${runtime} documentation.**

Workflow:

1. **Query ${runtime} documentation**:
  - Use 'get_crate_overview' for ${runtime} (version: ${version}) to understand async patterns
  - If a helpful item isn't found, use 'list_modules' for the crate to locate the module path and fetch the item docs for types/functions used in the code
  - Use 'get_item_docs' for specific types you need (e.g., tokio::task::spawn) with version ${version}
   - Get up-to-date API information, don't rely on training data

2. **Analyze the code**:
   - Identify I/O operations that should be async
   - Check for blocking calls that need async alternatives

3. **Convert to async**:
   - Update function signature to async
   - Add .await calls based on ${runtime} docs
   - Handle Send/Sync bounds as documented
   - Update error handling for async

4. **Provide result**:
   - Complete async version
   - Explanation of changes
   - Testing suggestions from docs

**Start by querying ${runtime} documentation using the tools.**`,
            },
          },
        ],
      };
    }

    case "handle-errors-idiomatically": {
      const code = args?.code || "";
      const strategy = args?.error_strategy || "Result and ?";
      const version = args?.version || "latest";

      return {
        prompt,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I need to add idiomatic error handling to this Rust code using ${strategy}:

\`\`\`rust
${code}
\`\`\`

**IMPORTANT: Query documentation for current error handling patterns.**

Workflow:

1. **Query documentation** (if using thiserror/anyhow):
  - Use 'get_crate_overview' for the error handling crate (version: ${version})
  - If specific types/macros aren't found, use 'list_modules' to find their module path, then fetch the item docs
  - Use 'get_item_docs' for specific error types/macros with version ${version}
   - Get current best practices from docs

2. **Analyze the code**:
   - Identify operations that can fail
   - Find panics/unwraps that need replacement

3. **Implement error handling**:
   - Define error types based on docs (if using thiserror)
   - Replace panics with proper error handling
   - Use ? operator for propagation
   - Add helpful error messages

4. **Show usage**:
   - How to handle at call site
   - Follow patterns from documentation

**Query the relevant crate docs first using the tools.**`,
            },
          },
        ],
      };
    }

    case "add-send-sync-bounds": {
      const code = args?.code || "";
      const useCase = args?.use_case || "async tasks";
      const version = args?.version || "latest";

      return {
        prompt,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I need to add Send/Sync bounds for ${useCase}:

\`\`\`rust
${code}
\`\`\`

**IMPORTANT: Query std documentation for Send/Sync definitions.**

Workflow:

1. **Query documentation**:
  - Use 'get_item_docs' for std::marker::Send trait (version: ${version})
  - If any type is missing, call 'list_modules' for the crate to find its actual module
  - Use 'get_item_docs' for std::marker::Sync trait (version: ${version})
   - Understand what types implement these traits

2. **Analyze the code**:
   - Identify where Send/Sync bounds are needed
   - Find non-Send/Sync types in the code

3. **Fix the code**:
   - Add appropriate trait bounds based on docs
   - Replace non-Send/Sync types (Rc → Arc, RefCell → Mutex)
   - Verify compatibility with ${useCase}

4. **Provide result**:
   - Corrected code
   - Explanation of changes
   - Why these bounds are required

**Start by querying Send/Sync trait documentation.**`,
            },
          },
        ],
      };
    }

    case "fix-lifetime-errors": {
      const errorMessage = args?.error_message || "";
      const code = args?.code || "";
      const version = args?.version || "latest";

      return {
        prompt,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I'm getting a lifetime error in my Rust code:

**Error:**
\`\`\`
${errorMessage}
\`\`\`

${code ? `**Code:**\n\`\`\`rust\n${code}\n\`\`\`\n` : ""}

**IMPORTANT: Use MCP tools if the error mentions specific types or traits.**

Workflow:

1. **Query docs if needed**:
  - If error mentions a specific type/trait, use 'get_item_docs' to understand it (use version ${version} if applicable). If not found, run 'list_modules' to find correct module path
   - Check lifetime requirements in the type's documentation
   - Get current API information

2. **Analyze the error**:
   - Explain what the error means in simple terms
   - Identify the lifetime issue
   - Check if types involved have specific lifetime requirements

3. **Suggest solutions**:
   - Multiple approaches if applicable
   - When to use 'static vs lifetime parameters vs owned types
   - Show corrected code

4. **Provide prevention tips**:
   - How to avoid similar errors
   - Patterns from documentation

**Query relevant type docs if the error references specific types.**`,
            },
          },
        ],
      };
    }

    case "optimize-for-performance": {
      const code = args?.code || "";
      const bottleneck = args?.bottleneck || "";
      const version = args?.version || "latest";

      return {
        prompt,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I need to optimize this Rust code for performance:

\`\`\`rust
${code}
\`\`\`

${bottleneck ? `Known bottleneck: ${bottleneck}\n` : ""}

**IMPORTANT: Query documentation for performance-optimized alternatives.**

Workflow:

1. **Query relevant docs**:
  - If using collections, query std::collections docs for performance characteristics (use version: ${version} if applicable)
  - If a particular type is not found, use 'list_modules' to find it within the crate and re-query
  - If using async, query runtime docs for performance tips (use version: ${version} if applicable)
   - Check documentation for performance notes on types used

2. **Identify issues**:
   - Unnecessary allocations
   - Clone/copy overhead
   - Inefficient algorithms (check docs for time complexity)
   - Lock contention
   - Cache misses

3. **Suggest improvements** based on docs:
   - Zero-copy techniques from documentation
   - Better data structures (with perf characteristics from docs)
   - Parallelization opportunities
   - Memory layout optimization

4. **Provide result**:
   - Optimized code with benchmarking suggestions
   - Trade-offs from documentation
   - When NOT to optimize

**Query std or relevant crate docs for performance guidance first.**`,
            },
          },
        ],
      };
    }

    default:
      throw new Error(`Prompt implementation not found: ${name}`);
  }
}
