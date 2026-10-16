import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
  isAllowedCalcomSource,
  parseCalcomWebhook,
  verifyCalcomSignature,
} from "../src/lib/calcom-webhook.ts";

const secret = "unit-test-secret-with-more-than-thirty-two-characters";
const payload = {
  uid: "booking-uid-123",
  eventTypeId: 771,
  organizer: { username: "santiersyncro", email: "owner@example.test" },
  attendees: [{ name: "Ana Pop", email: "ana@example.test" }],
  responses: {
    gestionare_cereri: { label: "Cum gestionați acum cererile?", value: "Mesaje răspândite" },
    blocaj_timp: { label: "Unde pierdeți cel mai mult timp?", value: "Centralizarea solicitărilor" },
    firma: { label: "Firmă", value: "Firma Exemplu" },
  },
  startTime: "2026-10-20T10:00:00.000Z",
  endTime: "2026-10-20T10:30:00.000Z",
};

function wrapped(triggerEvent, extra = {}) {
  return {
    triggerEvent,
    createdAt: "2026-10-13T10:15:00.000Z",
    payload: { ...payload, ...extra },
  };
}

test("verifies Cal.com HMAC over the exact raw body and rejects tampering", () => {
  const body = JSON.stringify(wrapped("BOOKING_CREATED"));
  const signature = createHmac("sha256", secret).update(body).digest("hex");
  assert.equal(verifyCalcomSignature(body, signature, secret), true);
  assert.equal(verifyCalcomSignature(`${body} `, signature, secret), false);
  assert.equal(verifyCalcomSignature(body, "0".repeat(64), secret), false);
  assert.equal(verifyCalcomSignature(body, "invalid", secret), false);
});

test("normalizes a valid booking and checks the configured event type and organizer", () => {
  const parsed = parseCalcomWebhook(wrapped("BOOKING_CREATED"));
  assert.equal(parsed.kind, "supported");
  assert.deepEqual(parsed.event, {
    triggerEvent: "BOOKING_CREATED",
    eventCreatedAt: "2026-10-13T10:15:00.000Z",
    uid: "booking-uid-123",
    eventTypeId: 771,
    organizerUsername: "santiersyncro",
    name: "Ana Pop",
    email: "ana@example.test",
    company: "Firma Exemplu",
    startTime: "2026-10-20T10:00:00.000Z",
    endTime: "2026-10-20T10:30:00.000Z",
    requestHandling: "Mesaje răspândite",
    timeBottleneck: "Centralizarea solicitărilor",
    bookingStatus: "Programată",
  });
  assert.equal(isAllowedCalcomSource(parsed.event, 771, "santiersyncro"), true);
  assert.equal(isAllowedCalcomSource(parsed.event, 772, "santiersyncro"), false);
  assert.equal(isAllowedCalcomSource(parsed.event, 771, "someone-else"), false);
});

test("requires nonblank answers for creates and requests, but permits missing answers on updates", () => {
  const noAnswers = {
    gestionare_cereri: { label: "Cum gestionați acum cererile?", value: "  " },
    blocaj_timp: { label: "Unde pierdeți cel mai mult timp?", value: "" },
  };
  assert.equal(parseCalcomWebhook(wrapped("BOOKING_CREATED", { responses: noAnswers })).kind, "invalid");
  assert.equal(parseCalcomWebhook(wrapped("BOOKING_REQUESTED", { responses: noAnswers })).kind, "invalid");
  assert.equal(parseCalcomWebhook(wrapped("BOOKING_CANCELLED", { responses: {} })).kind, "supported");
  assert.equal(parseCalcomWebhook(wrapped("BOOKING_RESCHEDULED", { responses: {}, rescheduleUid: "old-uid" })).kind, "supported");
});

test("accepts multiline textarea answers without accepting blank required answers", () => {
  const multiline = wrapped("BOOKING_CREATED", {
    responses: {
      ...payload.responses,
      gestionare_cereri: { label: "Cum gestionați acum cererile?", value: "Mesaje și apeluri\nîn locuri diferite" },
      blocaj_timp: { label: "Unde pierdeți cel mai mult timp?", value: "Copierea datelor\r\nîn mai multe tabele" },
    },
  });
  const parsed = parseCalcomWebhook(multiline);
  assert.equal(parsed.kind, "supported");
  assert.equal(parsed.event.requestHandling, "Mesaje și apeluri\nîn locuri diferite");
  assert.equal(parsed.event.timeBottleneck, "Copierea datelor\r\nîn mai multe tabele");
});

test("rejects mislabeled, oversized, and malformed values and ignores unsupported triggers", () => {
  assert.equal(parseCalcomWebhook(wrapped("BOOKING_CREATED", {
    responses: { ...payload.responses, gestionare_cereri: { label: "Other", value: "answer" } },
  })).kind, "invalid");
  assert.equal(parseCalcomWebhook(wrapped("BOOKING_CREATED", {
    responses: { ...payload.responses, blocaj_timp: { label: "Unde pierdeți cel mai mult timp?", value: "x".repeat(1501) } },
  })).kind, "invalid");
  assert.equal(parseCalcomWebhook(wrapped("BOOKING_CREATED", { eventTypeId: "771" })).kind, "invalid");
  assert.equal(parseCalcomWebhook(wrapped("BOOKING_NO_LONGER_SUPPORTED")).kind, "unsupported");
  assert.equal(parseCalcomWebhook(null).kind, "invalid");
});
