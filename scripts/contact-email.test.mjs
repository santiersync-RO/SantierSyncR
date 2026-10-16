import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/email.server.ts", import.meta.url), "utf8");
const runnable = source
  .replace(/^import "server-only";\s*/m, "")
  .replace(/^import \{ createHash \} from "node:crypto";\s*/m, "")
  .replace(/^import type \{ ContactInput \} from "@\/lib\/contact-schema";\s*/m, "")
  .replace(/^export type EmailResult.*\r?\n/m, "")
  .replace(/\bexport async function sendContactEmail/, "async function sendContactEmail") + "\nglobalThis.sendContactEmail = sendContactEmail;";
const javascript = ts.transpile(runnable, { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None });

function setup({ response, env = {} } = {}) {
  const calls = [];
  const context = { createHash, process: { env: { RESEND_API_KEY: "test-key", CONTACT_TO_EMAIL: "inbox@example.test", CONTACT_FROM_EMAIL: "site@example.test", ...env } }, fetch: async (_url, options) => { calls.push(options); return response ?? new Response(JSON.stringify({ id: "email-accepted-1" }), { status: 200 }); }, AbortController, setTimeout, clearTimeout, JSON, URLSearchParams, console };
  vm.createContext(context);
  vm.runInContext(javascript, context);
  return { send: async (...args) => JSON.parse(JSON.stringify(await context.sendContactEmail(...args))), calls };
}

const input = { name: "Ana Pop", email: "ana@example.test", company: "", message: "Bună, aș dori să discutăm despre cereri." };

test("only a provider acceptance with a nonempty ID succeeds and retries keep one idempotency key", async () => {
  const { send, calls } = setup();
  const first = await send(input, "00000000-0000-4000-8000-000000000001");
  const retry = await send(input, "00000000-0000-4000-8000-000000000001");
  assert.deepEqual(first, { ok: true, providerId: "email-accepted-1" });
  assert.deepEqual(retry, first);
  assert.equal(calls[0].headers["Idempotency-Key"], calls[1].headers["Idempotency-Key"]);
  assert.equal(calls[0].headers["Idempotency-Key"].length, 64);
  assert.match(calls[0].body, /ana@example\.test/);
});

test("provider errors, empty IDs, and missing credentials never count as success", async () => {
  const providerError = setup({ response: new Response("{}", { status: 502 }) });
  assert.deepEqual(await providerError.send(input, "00000000-0000-4000-8000-000000000002"), { ok: false, reason: "provider" });
  const noId = setup({ response: new Response(JSON.stringify({ id: "  " }), { status: 200 }) });
  assert.deepEqual(await noId.send(input, "00000000-0000-4000-8000-000000000003"), { ok: false, reason: "provider" });
  const missing = setup({ env: { RESEND_API_KEY: "" } });
  assert.deepEqual(await missing.send(input, "00000000-0000-4000-8000-000000000004"), { ok: false, reason: "configuration" });
});
