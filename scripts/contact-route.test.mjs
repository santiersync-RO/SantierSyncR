import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const zod = require("zod");
const transpile = (source) => ts.transpile(source, { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS });
const schemaSource = await readFile(new URL("../src/lib/contact-schema.ts", import.meta.url), "utf8");
const schemaModule = { exports: {} };
vm.runInNewContext(`(function(require,module,exports){${transpile(schemaSource)}\n})(require,module,module.exports)`, { require: (id) => id === "zod" ? zod : require(id), module: schemaModule });
const contactSchema = schemaModule.exports.contactSchema;
const routeSource = await readFile(new URL("../src/app/api/contact/route.ts", import.meta.url), "utf8");

function loadRoute({ env = {}, turnstile = { ok: true }, email = { ok: true, providerId: "accepted-email" }, enabled = true } = {}) {
  const calls = { email: 0, registry: 0 };
  const deps = {
    "next/server": { NextResponse: { json: (body, options) => Response.json(body, options) } },
    "@/config/site": { siteConfig: { contactEnabled: enabled, publicEmail: "inbox@example.test" } },
    "@/lib/contact-schema": { contactSchema },
    "@/lib/email.server": { sendContactEmail: async () => { calls.email += 1; return email; } },
    "@/lib/turnstile.server": { verifyTurnstile: async () => turnstile },
    "@/lib/contact-registry.server": { sendContactToRegistry: async () => { calls.registry += 1; return "ok"; } },
  };
  const routeModule = { exports: {} };
  const context = { process: { env: { CONTACT_ENABLED: "true", CONTACT_ALLOWED_ORIGINS: "https://santiersync.ro", ...env } }, Response, Request, URL, TextDecoder, Uint8Array, JSON, Number, Promise, setTimeout, clearTimeout };
  vm.runInNewContext(`(function(require,module,exports){${transpile(routeSource)}\n})(require,module,module.exports)`, { ...context, require: (id) => deps[id] ?? require(id), module: routeModule });
  return { post: routeModule.exports.POST, calls };
}

const submission = (overrides = {}) => ({
  name: "Ana Pop", email: "ana@example.test", company: "", message: "Aș dori să discutăm despre organizarea cererilor.",
  requestId: "00000000-0000-4000-8000-000000000001", website: "", turnstileToken: "valid-token", ...overrides,
});
const request = (payload, { origin = "https://santiersync.ro", headers = {}, raw = false } = {}) => new Request("https://santiersync.ro/api/contact", {
  method: "POST", headers: { origin, "content-type": "application/json", ...headers }, body: raw ? payload : JSON.stringify(payload),
});

test("valid request returns 200 only after provider acceptance", async () => {
  const { post, calls } = loadRoute();
  const response = await post(request(submission()));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).message, "Am primit mesajul tău. Îți vom răspunde pe email.");
  assert.equal(calls.email, 1);
});

test("invalid input, missing configuration, origin mismatch, oversized body, and honeypot are rejected", async () => {
  let setup = loadRoute();
  assert.equal((await setup.post(request(submission({ name: "" })))).status, 400);
  setup = loadRoute({ enabled: false });
  assert.equal((await setup.post(request(submission()))).status, 503);
  setup = loadRoute();
  assert.equal((await setup.post(request(submission(), { origin: "https://attacker.test" }))).status, 403);
  assert.equal((await setup.post(request("x".repeat(17 * 1024), { raw: true }))).status, 413);
  assert.equal((await setup.post(request(submission({ website: "spam" })))).status, 400);
  assert.equal(setup.calls.email, 0);
});

test("Turnstile and provider failures never return success", async () => {
  let setup = loadRoute({ turnstile: { ok: false, reason: "invalid" } });
  assert.equal((await setup.post(request(submission()))).status, 403);
  assert.equal(setup.calls.email, 0);
  setup = loadRoute({ email: { ok: false, reason: "provider" } });
  assert.equal((await setup.post(request(submission()))).status, 503);
  assert.equal(setup.calls.email, 1);
});

test("contact form uses POST so browser fallback cannot put submitted fields in the URL", async () => {
  const source = await readFile(new URL("../src/components/ContactForm.tsx", import.meta.url), "utf8");
  assert.match(source, /method="post"\s+action="\/api\/contact"/);
  assert.match(source, /<noscript>[\s\S]*mailto:/);
});
