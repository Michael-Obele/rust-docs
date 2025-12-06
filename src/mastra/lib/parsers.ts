/**
 * HTML parsers for docs.rs pages
 * Uses cheerio for jQuery-like HTML parsing
 */

import * as cheerio from "cheerio";

/**
 * Parsed crate overview from docs.rs
 */
export interface CrateOverview {
  name: string;
  version: string;
  description: string;
  modules: string[];
  structs: string[];
  enums: string[];
  traits: string[];
  functions: string[];
  macros: string[];
  types: string[];
  constants: string[];
  content: string;
  url: string;
}

/**
 * Parsed item documentation
 */
export interface ItemDocs {
  name: string;
  type: string;
  signature: string;
  description: string;
  methods: string[];
  variants: string[];
  implementations: string[];
  examples: string;
  url: string;
}

/**
 * Module items listing
 */
export interface ModuleItems {
  modules: string[];
  structs: string[];
  enums: string[];
  traits: string[];
  functions: string[];
  macros: string[];
  types: string[];
  constants: string[];
  url: string;
}

/**
 * Parse crate overview page from docs.rs
 */
export function parseCrateOverview(
  html: string,
  crateName: string,
  version: string,
  url: string
): CrateOverview {
  const $ = cheerio.load(html);

  // Extract description from the main docblock
  const description = $(".docblock").first().text().trim();

  // Extract items from each section
  const modules = extractItems($, "#modules");
  const structs = extractItems($, "#structs");
  const enums = extractItems($, "#enums");
  const traits = extractItems($, "#traits");
  const functions = extractItems($, "#functions");
  const macros = extractItems($, "#macros");
  const types = extractItems($, "#types");
  const constants = extractItems($, "#constants");

  // Get full content for context
  const content = $("main").text().trim().slice(0, 5000); // Limit to 5000 chars

  return {
    name: crateName,
    version,
    description,
    modules,
    structs,
    enums,
    traits,
    functions,
    macros,
    types,
    constants,
    content,
    url,
  };
}

/**
 * Extract items from a section (modules, structs, etc.)
 */
function extractItems($: cheerio.CheerioAPI, sectionId: string): string[] {
  const section = $(sectionId);
  if (!section.length) return [];

  // Try the actual docs.rs structure: h2#modules + dl.item-table + dt a
  const items = section
    .next(".item-table")
    .find("dt a")
    .map((_, el) => $(el).text().trim())
    .get();

  if (items.length > 0) return items;

  // Try alternative structure: a.mod within item-table
  const altItems = section
    .next(".item-table")
    .find("a.mod")
    .map((_, el) => $(el).text().trim())
    .get();

  if (altItems.length > 0) return altItems;

  // Fallback to older structure
  return section
    .parent()
    .find(".item-left a")
    .map((_, el) => $(el).text().trim())
    .get();
}

/**
 * Parse item documentation page (struct, enum, trait, etc.)
 */
export function parseItemDocs(
  html: string,
  context: {
    crate: string;
    item_type: string;
    item_name: string;
    module?: string;
  }
): ItemDocs {
  const $ = cheerio.load(html);

  // Extract signature from the item-decl section
  const signature = $(".item-decl, .rust.item-decl").first().text().trim();

  // Extract main description
  const description = $(".docblock").first().text().trim();

  // Extract methods
  const methods: string[] = [];
  $(".method, .impl-items .method").each((_, el) => {
    const methodSig = $(el).find(".code-header, .fn").first().text().trim();
    if (methodSig) {
      methods.push(methodSig);
    }
  });

  // Extract variants (for enums)
  const variants: string[] = [];
  $(".variant").each((_, el) => {
    const variantName = $(el).find(".code-header").first().text().trim();
    if (variantName) {
      variants.push(variantName);
    }
  });

  // Extract implementations
  const implementations: string[] = [];
  $("#trait-implementations-list h3, #implementations-list h3").each(
    (_, el) => {
      const implName = $(el).text().trim();
      if (implName) {
        implementations.push(implName);
      }
    }
  );

  // Extract examples from code blocks
  const examples = $(".docblock pre.rust, .example-wrap pre.rust")
    .map((_, el) => $(el).text().trim())
    .get()
    .join("\n\n");

  const cratePath = context.crate.replace(/-/g, "_");
  const modulePath = context.module ? `${context.module}/` : "";
  const url = `https://docs.rs/${context.crate}/latest/${cratePath}/${modulePath}${context.item_type}.${context.item_name}.html`;

  return {
    name: context.item_name,
    type: context.item_type,
    signature,
    description,
    methods,
    variants,
    implementations,
    examples,
    url,
  };
}

/**
 * Parse module items listing
 */
export function parseModuleItems(html: string, url: string): ModuleItems {
  const $ = cheerio.load(html);

  return {
    modules: extractItems($, "#modules"),
    structs: extractItems($, "#structs"),
    enums: extractItems($, "#enums"),
    traits: extractItems($, "#traits"),
    functions: extractItems($, "#functions"),
    macros: extractItems($, "#macros"),
    types: extractItems($, "#types"),
    constants: extractItems($, "#constants"),
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
