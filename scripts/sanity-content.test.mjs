import assert from "node:assert/strict";
import test from "node:test";
import { defaultSiteContent, parseSiteContent, siteContentSchema } from "../src/content/site-content.ts";

test("defaults preserve exact copy and meaningful heading spaces", () => {
  assert.deepEqual(parseSiteContent(structuredClone(defaultSiteContent)), defaultSiteContent);
  assert.equal(defaultSiteContent.home.hero.description, "Punem în ordine cererile și ofertele firmelor de construcții și instalații din Cluj. Vezi cine răspunde, ce informații lipsesc și când trebuie revenit la client.");
  assert.equal(defaultSiteContent.home.offers[0].price, "Implementare de bază · 1.900 lei");
  assert.equal(defaultSiteContent.home.faq[0].question, "Trebuie să schimb programele pe care le folosesc?");
  assert.match(defaultSiteContent.home.demoRequests[0].missing, /Modelul/);
  assert.equal(defaultSiteContent.home.servicesIntro.title[1], "care ");
  assert.equal(defaultSiteContent.home.about.title[1], "celor care ");
});

test("valid CMS edits retain text and remove Sanity array metadata", () => {
  const content = structuredClone(defaultSiteContent);
  content.home.services[0] = { ...content.home.services[0], _key: "service-1", _type: "serviceItem", title: "Serviciu editat" };
  content.footer._type = "object";
  content.contactForm._type = "object";
  const result = parseSiteContent(content);
  assert.notEqual(result, defaultSiteContent);
  assert.deepEqual(result.home.services[0], { title: "Serviciu editat", description: content.home.services[0].description });
  assert.deepEqual(result.footer, defaultSiteContent.footer);
});

test("published v1 singleton migrates to v2 while retaining valid editor-owned fields", () => {
  const legacy = structuredClone(defaultSiteContent);
  delete legacy.home.offers;
  delete legacy.home.demoRequests;
  delete legacy.home.faq;
  legacy.footer.slogan = "Text păstrat din Studio";
  legacy.home.contactIntro.email = "contact@example.ro";
  legacy.branding.logo.alt = "Logo existent păstrat";

  const migrated = parseSiteContent(legacy);
  assert.equal(migrated.footer.slogan, "Text păstrat din Studio");
  assert.equal(migrated.home.contactIntro.email, "contact@example.ro");
  assert.equal(migrated.branding.logo.alt, "Logo existent păstrat");
  assert.equal(migrated.home.navigation.cta, "Programează o discuție de 30 min");
  assert.equal(migrated.home.hero.description, defaultSiteContent.home.hero.description);
  assert.deepEqual(migrated.home.offers, defaultSiteContent.home.offers);
  assert.deepEqual(migrated.home.demoRequests, defaultSiteContent.home.demoRequests);
  assert.deepEqual(migrated.home.faq, defaultSiteContent.home.faq);
});

test("incomplete content, unsafe navigation and invalid email fall back safely", () => {
  for (const mutate of [
    (value) => value.home.services.pop(),
    (value) => value.home.offers.pop(),
    (value) => value.home.demoRequests.pop(),
    (value) => value.home.faq.pop(),
    (value) => value.home.hero.stages.pop(),
    (value) => value.home.about.paragraphs.pop(),
    (value) => value.home.navigation.links[0].href = "javascript:alert(1)",
    (value) => value.home.navigation.links[0].href = "https://example.com",
    (value) => value.home.contactIntro.email = "bad address",
    (value) => value.contactForm.noteTemplate = "Missing placeholder",
    (value) => value.home.hero.description = " ",
  ]) {
    const content = structuredClone(defaultSiteContent);
    mutate(content);
    assert.equal(parseSiteContent(content), defaultSiteContent);
  }
});

test("logo is restricted to the configured project and dataset", () => {
  const previous = [process.env.SANITY_PROJECT_ID, process.env.SANITY_DATASET];
  process.env.SANITY_PROJECT_ID = "abcd1234";
  process.env.SANITY_DATASET = "production";
  try {
    const content = structuredClone(defaultSiteContent);
    content.branding.logo.url = "https://cdn.sanity.io/images/abcd1234/production/abcdef1234-1774x887.png";
    assert.equal(siteContentSchema.safeParse(content).success, true);
    for (const url of ["https://evil.example/logo.png", "https://cdn.sanity.io/images/other123/production/abcdef-100x100.png", "/brand/logo-original.png/other"]) {
      content.branding.logo.url = url;
      assert.equal(parseSiteContent(content), defaultSiteContent);
    }
  } finally {
    if (previous[0] === undefined) delete process.env.SANITY_PROJECT_ID; else process.env.SANITY_PROJECT_ID = previous[0];
    if (previous[1] === undefined) delete process.env.SANITY_DATASET; else process.env.SANITY_DATASET = previous[1];
  }
});
