import test from "node:test";
import assert from "node:assert/strict";
import { trackSiteEvent } from "../src/lib/analytics-events.ts";

function installBrowser({ consent = true, status = true, path = "/programare", origin = "https://santiersync.ro" } = {}) {
  const calls = [];
  const originalWindow = globalThis.window;
  globalThis.window = {
    location: { origin, pathname: path },
    __cmp(command) {
      if (command === "getCMPData") {
        return consent === "unknown" ? null : { vendorConsents: { s26: consent } };
      }
      if (command === "consentStatus") {
        return status === "unknown" ? null : { consentExists: status };
      }
      return null;
    },
    __santierSyncGaInitialized: "G-TEST123",
    "ga-disable-G-TEST123": false,
    gtag(...args) { calls.push(args); },
  };
  return {
    calls,
    restore() {
      if (originalWindow === undefined) delete globalThis.window;
      else globalThis.window = originalWindow;
    },
  };
}

test("withheld consent drops the event without queueing it", () => {
  const browser = installBrowser({ consent: false, status: true });
  try {
    trackSiteEvent("calendar_open");
    assert.deepEqual(browser.calls, []);
  } finally { browser.restore(); }
});

test("unknown CMP state drops the event", () => {
  const browser = installBrowser({ consent: "unknown", status: "unknown" });
  try {
    trackSiteEvent("contact_submit_success");
    assert.deepEqual(browser.calls, []);
  } finally { browser.restore(); }
});

test("explicit consent sends one allowlisted event with a static clean path", () => {
  const browser = installBrowser({ path: "/programare" });
  try {
    trackSiteEvent("calendar_open");
    assert.deepEqual(browser.calls, [[
      "event",
      "calendar_open",
      { page_location: "https://santiersync.ro/programare" },
    ]]);
  } finally { browser.restore(); }
});

test("event names, origin, path, and tracker readiness are validated at runtime", () => {
  const browser = installBrowser({ origin: "https://preview.santiersync.ro" });
  try {
    trackSiteEvent("calendar_open");
    assert.deepEqual(browser.calls, []);
  } finally { browser.restore(); }

  const invalidEvent = installBrowser();
  try {
    trackSiteEvent("booking_confirmed");
    assert.deepEqual(invalidEvent.calls, []);
  } finally { invalidEvent.restore(); }

  const unreadyTracker = installBrowser();
  try {
    globalThis.window["ga-disable-G-TEST123"] = true;
    trackSiteEvent("contact_submit_success");
    assert.deepEqual(unreadyTracker.calls, []);
  } finally { unreadyTracker.restore(); }
});

test("event parameters contain no user values, query, hash, referrer, or request id", () => {
  const browser = installBrowser({ path: "/" });
  try {
    trackSiteEvent("contact_submit_success");
    const serialized = JSON.stringify(browser.calls);
    assert.equal(serialized.includes("@"), false);
    assert.equal(serialized.includes("requestId"), false);
    assert.equal(serialized.includes("referrer"), false);
    assert.equal(serialized.includes("?"), false);
    assert.equal(serialized.includes("#"), false);
  } finally { browser.restore(); }
});

test("a gtag failure does not escape to the caller", () => {
  const browser = installBrowser();
  try {
    globalThis.window.gtag = () => { throw new Error("blocked"); };
    assert.doesNotThrow(() => trackSiteEvent("contact_submit_success"));
  } finally { browser.restore(); }
});
