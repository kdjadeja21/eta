#!/usr/bin/env node
/**
 * Writes lib/version.json with the current package version and UTC timestamp.
 * Run automatically as a "prebuild" npm script so every production build
 * captures the exact deploy time.
 */

const fs = require("fs");
const path = require("path");

const pkg = require("../package.json");

const versionData = {
  version: pkg.version,
  lastUpdated: new Date().toISOString(),
  timezone: "UTC",
};

const outPath = path.join(__dirname, "..", "lib", "version.json");
fs.writeFileSync(outPath, JSON.stringify(versionData, null, 2) + "\n");

console.log(
  `[update-version] version=${versionData.version} lastUpdated=${versionData.lastUpdated}`
);
