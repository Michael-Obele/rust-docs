/**
 * HTML parsers for docs.rs pages using Turndown
 * Converts HTML to Markdown instead of structured extraction
 */

import TurndownService from "turndown";

/**
 * Parsed crate overview as Markdown
 */
export interface CrateOverviewMarkdown {
  name: string;
  version: string;
  markdown: string;
  url: string;
}

/**
 * Parsed item documentation as Markdown
 */
export interface ItemDocsMarkdown {
  name: string;
  type: string;
  markdown: string;
  url: string;
}

/**
 * Module items as Markdown
 */
export interface ModuleItemsMarkdown {
  markdown: string;
  url: string;
}

// Create Turndown service with custom options
const turndownService = new TurndownService({
  headingStyle: 'atx', // Use # for headings
  codeBlockStyle: 'fenced', // Use ``` for code blocks
  emDelimiter: '*', // Use * for emphasis
  strongDelimiter: '**', // Use ** for strong
  linkStyle: 'inlined', // Keep links inline
  linkReferenceStyle: 'full', // Use full URLs
});

/**
 * Parse crate overview page from docs.rs to Markdown
 */
export function parseCrateOverviewMarkdown(
  html: string,
  crateName: string,
  version: string,
  url: string
): CrateOverviewMarkdown {
  // Convert the entire HTML to markdown
  const markdown = turndownService.turndown(html);

  return {
    name: crateName,
    version,
    markdown,
    url,
  };
}

/**
 * Parse item documentation page to Markdown
 */
export function parseItemDocsMarkdown(
  html: string,
  context: {
    crate: string;
    item_type: string;
    item_name: string;
    module?: string;
  }
): ItemDocsMarkdown {
  // Convert the entire HTML to markdown
  const markdown = turndownService.turndown(html);

  const cratePath = context.crate.replace(/-/g, "_");
  const modulePath = context.module ? `${context.module}/` : "";
  const url = `https://docs.rs/${context.crate}/latest/${cratePath}/${modulePath}${context.item_type}.${context.item_name}.html`;

  return {
    name: context.item_name,
    type: context.item_type,
    markdown,
    url,
  };
}

/**
 * Parse module items listing to Markdown
 */
export function parseModuleItemsMarkdown(html: string, url: string): ModuleItemsMarkdown {
  // Convert the entire HTML to markdown
  const markdown = turndownService.turndown(html);

  return {
    markdown,
    url,
  };
}

/**
 * Check if HTML indicates a 404/not found page
 */
export function isNotFoundPage(html: string): boolean {
  return (
    html.includes("404") ||
    html.includes("Not Found") ||
    html.includes("crate not found") ||
    html.includes("does not have")
  );
}