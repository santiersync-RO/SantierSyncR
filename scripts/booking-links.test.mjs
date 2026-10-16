import test from "node:test";
import assert from "node:assert/strict";
import { calendarLinks } from "../src/lib/booking-links.ts";

test("calendar links preserve the event without overriding the visitor timezone or injecting unsupported locale parameters", () => {
  const links = calendarLinks("https://cal.com/santiersyncro/30min");
  const embed = new URL(links.embed);
  assert.equal(embed.pathname, "/santiersyncro/30min");
  assert.equal(embed.searchParams.has("locale"), false);
  assert.equal(embed.searchParams.get("embed"), "true");
  assert.equal(embed.searchParams.has("timeZone"), false);
  assert.equal(new URL(links.direct).searchParams.has("embed"), false);
});

test("calendar never accepts untrusted origins, credentials or prefilled personal data", () => {
  for (const value of ["http://cal.com/santiersyncro/30min", "https://evil.test/santiersyncro/30min", "https://cal.com/other/30min", "https://user:secret@cal.com/santiersyncro/30min", "https://cal.com/santiersyncro/30min?email=private@example.test", "https://cal.com/santiersyncro/30min#secret"]) {
    assert.equal(calendarLinks(value), null);
  }
});
