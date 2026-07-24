import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";

readline.createInterface({ input: process.stdin }).on("line", async (line) => {
  let request;
  try { request = JSON.parse(line); } catch { return; }
  if (request.id === undefined) return;
  try { respond(request.id, await dispatch(request.method, request.params ?? {})); }
  catch (error) { respondError(request.id, error); }
});

async function dispatch(method, params) {
  if (method === "initialize") return { protocolVersion: "1", capabilities: { jobs: true, progress: true } };
  if (method === "health") return { status: "ready" };
  if (method === "operations/list") return { operations: ["osnova-labs.note-linter.lint"] };
  if (method === "shutdown") return { ok: true };
  if (method !== "jobs/start") throw new Error(`Unknown method: ${method}`);
  const manifest = JSON.parse(await readFile(path.join(params.paths.input, "artifacts.json"), "utf8"));
  const payload = manifest[0]?.payloads?.find((item) => item.mediaType === "text/markdown" || item.mediaType === "text/plain") ?? manifest[0]?.payloads?.[0];
  if (!payload) throw new Error("A text artifact input is required.");
  const source = await readFile(path.join(params.paths.input, ...payload.path.split("/")), "utf8");
  const max = params.input.maxLineLength ?? 120;
  const findings = [];
  source.split(/\r?\n/).forEach((line, index) => {
    if (/\s+$/.test(line)) findings.push(`Line ${index + 1}: trailing whitespace`);
    if (line.length > max) findings.push(`Line ${index + 1}: ${line.length} characters (limit ${max})`);
    if (/\bTODO\b/i.test(line)) findings.push(`Line ${index + 1}: unresolved TODO`);
  });
  const report = [`# Note lint report`, "", findings.length ? findings.map((item) => `- ${item}`).join("\n") : "No issues found."].join("\n");
  await mkdir(params.paths.outbox, { recursive: true });
  await writeFile(path.join(params.paths.outbox, "report.md"), report);
  notify("jobs/progress", { jobId: params.jobId, progress: 1, message: "Report created" });
  return { structured: { issues: findings.length }, artifacts: [{ type: "osnova-labs.note-linter.report", title: "Note lint report", payloads: [{ path: "report.md", mediaType: "text/markdown" }], context: { mode: "automatic" } }] };
}

function respond(id, result) { process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}\n`); }
function respondError(id, error) { process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32000, message: error instanceof Error ? error.message : String(error) } })}\n`); }
function notify(method, params) { process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", method, params })}\n`); }
