import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";

const cancelled = new Set();
readline.createInterface({ input: process.stdin }).on("line", async (line) => {
  let request;
  try { request = JSON.parse(line); } catch { return; }
  if (request.method === "jobs/cancel") { cancelled.add(request.params?.jobId); if (request.id !== undefined) ok(request.id, { cancelled: true }); return; }
  if (request.id === undefined) return;
  try { ok(request.id, await dispatch(request.method, request.params ?? {})); }
  catch (error) { fail(request.id, error); }
});

async function dispatch(method, params) {
  if (method === "initialize") return { protocolVersion: "1", capabilities: { jobs: true, cancellation: true, progress: true } };
  if (method === "health") return { status: "ready" };
  if (method === "operations/list") return { operations: ["osnova-labs.media-studio.generate"] };
  if (method === "shutdown") return { ok: true };
  if (method !== "jobs/start") throw new Error(`Unknown method: ${method}`);
  const text = String(params.input.text);
  const frequency = Number(params.input.frequency ?? 440);
  await mkdir(params.paths.outbox, { recursive: true });
  progress(params.jobId, 0.2, "Creating summary");
  await writeFile(path.join(params.paths.outbox, "summary.md"), `# Study media\n\n${text}\n`);
  if (cancelled.has(params.jobId)) throw new Error("Cancelled");
  progress(params.jobId, 0.5, "Synthesizing audio cue");
  await writeFile(path.join(params.paths.outbox, "cue.wav"), createWav(frequency, 0.4));
  progress(params.jobId, 0.8, "Rendering study card");
  await writeFile(path.join(params.paths.outbox, "card.svg"), createSvg(text));
  progress(params.jobId, 1, "Media ready");
  return {
    structured: { durationMs: 400, outputs: 3 },
    artifacts: [
      { type: "osnova-labs.media-studio.text", title: "Study summary", payloads: [{ path: "summary.md", mediaType: "text/markdown" }], context: { mode: "automatic" } },
      { type: "osnova-labs.media-studio.audio", title: "Audio cue", payloads: [{ path: "cue.wav", mediaType: "audio/wav" }], context: { mode: "automatic" }, metadata: { durationMs: 400, frequency } },
      { type: "osnova-labs.media-studio.image", title: "Study card", payloads: [{ path: "card.svg", mediaType: "image/svg+xml" }], context: { mode: "none" } }
    ]
  };
}

function createWav(frequency, seconds) {
  const rate = 16000;
  const samples = Math.floor(rate * seconds);
  const dataSize = samples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0); buffer.writeUInt32LE(36 + dataSize, 4); buffer.write("WAVEfmt ", 8);
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(rate, 24); buffer.writeUInt32LE(rate * 2, 28); buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36); buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples; i++) buffer.writeInt16LE(Math.round(Math.sin(2 * Math.PI * frequency * i / rate) * 5000), 44 + i * 2);
  return buffer;
}

function createSvg(text) {
  const safe = text.slice(0, 80).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&apos;" })[character]);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="100%" height="100%" rx="30" fill="#151515"/><circle cx="95" cy="90" r="34" fill="#d12f6a"/><text x="70" y="230" fill="#f4f0ed" font-family="system-ui" font-size="34">${safe}</text><text x="70" y="380" fill="#d12f6a" font-family="system-ui" font-size="24">OSNOVA</text></svg>`;
}

function ok(id, result) { process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}\n`); }
function fail(id, error) { process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32000, message: error instanceof Error ? error.message : String(error) } })}\n`); }
function progress(jobId, value, message) { process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", method: "jobs/progress", params: { jobId, progress: value, message } })}\n`); }
