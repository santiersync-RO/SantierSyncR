import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const emptyContact = {
  CONTACT_ENABLED: "",
  NEXT_PUBLIC_CONTACT_ENABLED: "",
  CONTACT_ALLOWED_ORIGINS: "",
  TURNSTILE_ALLOWED_HOSTNAMES: "",
  CONTACT_TO_EMAIL: "",
  CONTACT_FROM_EMAIL: "",
  RESEND_API_KEY: "",
  TURNSTILE_SECRET_KEY: "",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "",
  SENDER_DOMAIN_VERIFIED: "",
  WAF_RATE_LIMIT_CONFIGURED: "",
};

const baseEnv = {
  ...process.env,
  CHECK_PRODUCTION: "true",
  VERCEL_ENV: "production",
  DEPLOYMENT_STAGE: "demo",
  SITE_URL: "https://santiersync.ro",
  PUBLIC_INDEXING_ENABLED: "false",
  DOMAIN_CONFIRMED: "false",
  LEGAL_REVIEWED: "false",
  RELEASE_APPROVED: "false",
  ...emptyContact,
};

function runReleaseCheck(overrides = {}) {
  return spawnSync(process.execPath, ["scripts/check-release.mjs"], {
    cwd: root,
    env: { ...baseEnv, ...overrides },
    encoding: "utf8",
  });
}

test("demo contact remains off with empty or explicit false flags and no legal approvals", () => {
  const emptyFlags = runReleaseCheck();
  assert.equal(emptyFlags.status, 0, emptyFlags.stderr || emptyFlags.stdout);

  const falseFlags = runReleaseCheck({ CONTACT_ENABLED: "false", NEXT_PUBLIC_CONTACT_ENABLED: "false" });
  assert.equal(falseFlags.status, 0, falseFlags.stderr || falseFlags.stdout);
});

test("demo can enable the API only with configured credentials, allowed origins, Turnstile, and sender verification", () => {
  const configured = runReleaseCheck({
    CONTACT_ENABLED: "true",
    NEXT_PUBLIC_CONTACT_ENABLED: "true",
    CONTACT_ALLOWED_ORIGINS: "https://santiersync.ro",
    TURNSTILE_ALLOWED_HOSTNAMES: "santiersync.ro",
    CONTACT_TO_EMAIL: "owner@santiersync.ro",
    CONTACT_FROM_EMAIL: "site@santiersync.ro",
    RESEND_API_KEY: "re_test_key",
    TURNSTILE_SECRET_KEY: "turnstile_secret_configured",
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: "turnstile_site_configured",
    SENDER_DOMAIN_VERIFIED: "true",
  });
  assert.equal(configured.status, 0, configured.stderr || configured.stdout);
  assert.doesNotMatch(configured.stdout, /WAF_RATE_LIMIT_CONFIGURED/);

  const incomplete = runReleaseCheck({
    CONTACT_ENABLED: "true",
    NEXT_PUBLIC_CONTACT_ENABLED: "true",
  });
  assert.notEqual(incomplete.status, 0);
  assert.match(incomplete.stderr, /RESEND_API_KEY/);
  assert.match(incomplete.stderr, /TURNSTILE_SECRET_KEY/);
});

test("production index opt-in rejects a Vercel preview alias", () => {
  const preview = runReleaseCheck({
    VERCEL_ENV: "preview",
    PUBLIC_INDEXING_ENABLED: "true",
  });
  assert.notEqual(preview.status, 0);
  assert.match(preview.stderr, /PUBLIC_INDEXING_ENABLED cere VERCEL_ENV=production/);
});
