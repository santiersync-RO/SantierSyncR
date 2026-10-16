import test from "node:test";
import assert from "node:assert/strict";
import { isPublicIndexingEnabled } from "../src/config/indexing-policy.ts";

const productionConfig = {
  PUBLIC_INDEXING_ENABLED: "true",
  VERCEL_ENV: "production",
  SITE_URL: "https://santiersync.ro",
  DEPLOYMENT_STAGE: "demo",
  RELEASE_APPROVED: "false",
  LEGAL_REVIEWED: "false",
};

test("explicit canonical production opt-in allows indexing independently of demo/release/legal flags", () => {
  assert.equal(isPublicIndexingEnabled(productionConfig), true);
});

test("public indexing defaults off", () => {
  assert.equal(isPublicIndexingEnabled({ VERCEL_ENV: "production", SITE_URL: "https://santiersync.ro" }), false);
});

test("preview, development, and noncanonical site URLs stay out of the index", () => {
  for (const override of [
    { VERCEL_ENV: "preview" },
    { VERCEL_ENV: "development" },
    { SITE_URL: "https://santiersync-git-feature.vercel.app" },
    { SITE_URL: "https://santiersync.ro/" },
  ]) {
    assert.equal(isPublicIndexingEnabled({ ...productionConfig, ...override }), false);
  }
});

test("flag parsing is explicit and case-insensitive", () => {
  assert.equal(isPublicIndexingEnabled({ ...productionConfig, PUBLIC_INDEXING_ENABLED: "yes" }), false);
  assert.equal(isPublicIndexingEnabled({ ...productionConfig, PUBLIC_INDEXING_ENABLED: " TRUE " }), true);
});
