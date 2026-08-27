import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { packExtension } from "../../queryn-sdk/dist/package.js";
import { QuerynRuntime } from "../../queryn-runtime/dist/index.js";
import { listArtifacts } from "../../queryn-core/packages/project/dist/index.js";

const root = await mkdtemp(path.join(os.tmpdir(), "queryn-advanced-e2e-"));
try {
  const runtime = new QuerynRuntime(path.join(root, "runtime"));
  await runtime.initialize();
  const projectPath = path.join(root, "project");
  await runtime.projects.create({ rootPath: projectPath, id: "media-e2e", name: "Media E2E" });
  const packagePath = path.join(root, "media.queryn-package.json");
  await packExtension(path.resolve(import.meta.dirname, "../examples/advanced-media-tool"), packagePath);
  await runtime.extensions.install(packagePath, { allowUnsigned: true });
  await runtime.extensions.connect(projectPath, "queryn-labs.media-studio", "1.0.0", ["artifact:create"]);
  const job = await runtime.operations.invokeAndWait({
    projectPath, operationId: "queryn-labs.media-studio.generate",
    arguments: { text: "Agent requested this operation; the tool produced the media.", frequency: 330 },
    publishArtifacts: true
  });
  assert.equal(job.status, "succeeded", job.error);
  const artifacts = await listArtifacts(projectPath);
  assert.equal(artifacts.length, 3);
  assert.deepEqual(new Set(artifacts.flatMap((artifact) => artifact.payloads.map((payload) => payload.mediaType))), new Set(["text/markdown", "audio/wav", "image/svg+xml"]));
  const wav = artifacts.find((artifact) => artifact.payloads[0]?.mediaType === "audio/wav");
  assert.ok(wav);
  const bytes = await readFile(path.join(projectPath, ...wav.payloads[0].path.split("/")));
  assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(runtime.supervisor.status("queryn-labs.media-studio.runtime")[0]?.status, "stopped");
  process.stdout.write(`Advanced Tool E2E passed: ${artifacts.map((artifact) => artifact.type).join(", ")}\n`);
} finally { await rm(root, { recursive: true, force: true }); }
