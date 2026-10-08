import assert from "node:assert/strict";
import { createClient } from "@sanity/client";
import nextEnv from "@next/env";
import { fileURLToPath } from "node:url";
import { encodeSignatureHeader } from "@sanity/webhook";
import { createPreviewSecret } from "@sanity/preview-url-secret/create-secret";
import { urlSearchParamPreviewSecret } from "@sanity/preview-url-secret/constants";
import { defaultSiteContent, parseSiteContent } from "../src/content/site-content.ts";

nextEnv.loadEnvConfig(fileURLToPath(new URL("../", import.meta.url)));
const origin = process.env.CMS_CHECK_ORIGIN || "http://localhost:3002";
const config = { projectId: process.env.SANITY_PROJECT_ID, dataset: process.env.SANITY_DATASET, apiVersion: "2026-10-08", useCdn: false };
const publicClient = createClient({ ...config, perspective: "published" });
const query = `*[_id == "siteContent" && _type == "siteContent"][0]{home,footer,contactForm,seo,"branding":{"logo":{"url":branding.logo.asset->url,"width":branding.logo.asset->metadata.dimensions.width,"height":branding.logo.asset->metadata.dimensions.height,"originalCrop":branding.logo.originalCrop,"alt":branding.logo.alt}}}`;
const content = parseSiteContent(await publicClient.fetch(query));
assert.notEqual(content, defaultSiteContent, "Published CMS document must pass validation.");
for (const section of ["home", "footer", "contactForm", "seo"]) assert.deepEqual(content[section], defaultSiteContent[section]);
console.info("Published CMS copy matches the existing website exactly.");

async function webhook(body, signature) {
  return fetch(`${origin}/api/sanity/revalidate`, { method: "POST", body, headers: { "Content-Type": "application/json", ...(signature ? { "sanity-webhook-signature": signature } : {}) } });
}
const payload = JSON.stringify({ _id: "siteContent", _type: "siteContent" });
assert.equal((await webhook(payload)).status, 401);
assert.equal((await webhook(payload, "invalid")).status, 401);
const signed = await encodeSignatureHeader(payload, Date.now(), process.env.SANITY_WEBHOOK_SECRET);
assert.equal((await webhook(payload, signed)).status, 204);
const draftPayload = JSON.stringify({ _id: "drafts.siteContent", _type: "siteContent" });
assert.equal((await webhook(draftPayload, await encodeSignatureHeader(draftPayload, Date.now(), process.env.SANITY_WEBHOOK_SECRET))).status, 400);
console.info("Webhook rejects missing/invalid signatures and draft payloads; accepts the signed published document.");
assert.equal((await fetch(`${origin}/api/draft-mode/enable`, { redirect: "manual" })).status, 401);
assert.equal((await fetch(`${origin}/api/draft-mode/enable?sanity-preview-secret=invalid`, { redirect: "manual" })).status, 401);

if (!process.env.SANITY_AUTH_TOKEN) throw new Error("Run this check through Sanity exec --with-user-token.");
const adminClient = createClient({ ...config, token: process.env.SANITY_AUTH_TOKEN });
const temporaryId = "sanity-preview-url-secret.santiersync-technical-check";
try {
  const { secret } = await createPreviewSecret(adminClient, "Santiersync technical check", process.env.SANITY_STUDIO_URL, undefined, temporaryId);
  const url = new URL("/api/draft-mode/enable", origin);
  url.searchParams.set(urlSearchParamPreviewSecret, secret);
  const response = await fetch(url, { redirect: "manual" });
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), `${origin}/`);
  assert.match(response.headers.get("cache-control"), /no-store/);
  const cookie = response.headers.getSetCookie().find((value) => value.startsWith("__prerender_bypass="));
  assert.ok(cookie?.includes("HttpOnly"));
  const preview = await fetch(`${origin}/`, { headers: { Cookie: cookie.split(";")[0] } });
  assert.equal(preview.status, 200);
  assert.ok((await preview.text()).includes("Previzualizare — modificări nepublicate"));
  const publicResponse = await fetch(`${origin}/`);
  assert.ok(!(await publicResponse.text()).includes("Previzualizare — modificări nepublicate"));
  console.info("Preview requires a valid Sanity secret and uses an HttpOnly cookie; public requests remain outside Draft Mode.");
} finally {
  await adminClient.delete(`drafts.${temporaryId}`);
}
