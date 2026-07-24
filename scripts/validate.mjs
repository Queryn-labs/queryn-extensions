import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { validateExtensionManifest } from "@osnova/plugin-sdk";
import { packExtension } from "@osnova/plugin-sdk/package";

const root = path.resolve(import.meta.dirname, "..");
const examplesRoot = path.join(root, "examples");
const outputRoot = await mkdtemp(path.join(os.tmpdir(), "osnova-extension-validation-"));
let checked = 0;
try {
  for (const entry of await readdir(examplesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join(examplesRoot, entry.name, "extension.json");
    let manifest;
    try { manifest = JSON.parse(await readFile(manifestPath, "utf8")); } catch { continue; }
    const validation = validateExtensionManifest(manifest);
    assert.equal(validation.valid, true, `${entry.name}: ${validation.issues.join("; ")}`);
    const packed = await packExtension(path.dirname(manifestPath), path.join(outputRoot, `${entry.name}.osnova-package.json`));
    assert.equal(packed.manifest.id, manifest.id);
    checked += 1;
  }
  const registry = JSON.parse(await readFile(path.join(root, "catalog", "registry.json"), "utf8"));
  assert.equal(registry.formatVersion, "1");
  assert.equal(registry.extensions.length, checked);
  process.stdout.write(`Validated ${checked} Reborn extension examples.\n`);
} finally { await rm(outputRoot, { recursive: true, force: true }); }
