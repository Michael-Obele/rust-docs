#!/usr/bin/env node
/**
 * Auto-sync version script
 *
 * This script checks if package.json and src/mastra/index.ts versions match.
 * If they don't match, it automatically syncs the versions (package.json is source of truth).
 *
 * Use this script when you want automatic version syncing without failing.
 * For strict checking that fails on mismatch, use check-versions.js instead.
 *
 * Usage:
 * - npm run sync-versions-auto (auto-sync and continue)
 */

import fs from "fs";
import path from "path";

const pkgPath = path.resolve(process.cwd(), "package.json");
const targetPath = path.resolve(process.cwd(), "src/mastra/index.ts");

if (!fs.existsSync(pkgPath)) {
  console.error("package.json not found");
  process.exit(1);
}
if (!fs.existsSync(targetPath)) {
  console.error("target file not found:", targetPath);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const packageVersion = pkg.version;

const code = fs.readFileSync(targetPath, "utf8");
const match = code.match(/version:\s*"([^"]+)"/);
if (!match) {
  console.error("Version not found in", targetPath);
  process.exit(1);
}
const codeVersion = match[1];

if (packageVersion !== codeVersion) {
  console.log(
    `Version mismatch detected: package.json has ${packageVersion}, ${targetPath} has ${codeVersion}. Syncing...`
  );

  // Update src/mastra/index.ts to match package.json (source of truth)
  const updatedCode = code.replace(/version:\s*"[^"]+",/, `version: "${packageVersion}",`);
  fs.writeFileSync(targetPath, updatedCode);
  console.log(`Updated ${targetPath} to ${packageVersion}`);
} else {
  console.log(`Versions already match: ${packageVersion}`);
}