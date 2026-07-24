import { writeFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";

readline.createInterface({ input: process.stdin }).on("line", async (line) => {
  let request;
  try { request = JSON.parse(line); } catch { return; }
  if (request.id === undefined) return;
  try {
    if (request.method === "initialize") return reply(request.id, { protocolVersion: "1", capabilities: { jobs: true } });
    if (request.method === "health") return reply(request.id, { status: "ready" });
    if (request.method === "shutdown") return reply(request.id, { ok: true });
    if (request.method !== "jobs/start") throw new Error(`Unknown method: ${request.method}`);
    await writeFile(path.join(request.params.paths.outbox, "result.md"), `# OCI result\n\n${request.params.input.text}\n`);
    reply(request.id, { structured: { ok: true }, artifacts: [{ type: "osnova-labs.oci-media.output", title: "OCI result", payloads: [{ path: "result.md", mediaType: "text/markdown" }], context: { mode: "automatic" } }] });
  } catch (error) {
    process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id: request.id, error: { code: -32000, message: error instanceof Error ? error.message : String(error) } })}\n`);
  }
});

function reply(id, result) { process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}\n`); }
