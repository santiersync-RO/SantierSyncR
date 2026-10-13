import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../integrations/google-sheets/Code.gs", import.meta.url), "utf8");
const sharedSecret = "registry-test-secret-with-more-than-thirty-two-characters";

function makeAppsScript() {
  const grid = [];
  const protections = [];
  const writes = [];
  let uuid = 0;
  const sheet = {
    getLastRow() {
      for (let index = grid.length - 1; index >= 0; index -= 1) {
        if ((grid[index] || []).some((cell) => cell !== "" && cell !== undefined)) return index + 1;
      }
      return 0;
    },
    getMaxRows: () => 1000,
    getRange: (row, col, rowCount = 1, colCount = 1) => ({
      getValues() {
        return Array.from({ length: rowCount }, (_, r) =>
          Array.from({ length: colCount }, (_, c) => grid[row - 1 + r]?.[col - 1 + c] ?? ""));
      },
      setValues(values) {
        writes.push({ row, col, rowCount: values.length, colCount: values[0]?.length ?? 0 });
        values.forEach((line, r) => {
          grid[row - 1 + r] ??= [];
          line.forEach((value, c) => { grid[row - 1 + r][col - 1 + c] = value; });
        });
      },
      setFontWeight() { return this; },
      protect: () => {
        const protection = {
          description: "",
          getDescription() { return this.description; },
          setDescription(value) { this.description = value; return this; },
          setWarningOnly() { return this; },
          getEditors: () => [],
          removeEditors() {},
          canDomainEdit: () => false,
          setDomainEdit() {},
        };
        protections.push(protection);
        return protection;
      },
    }),
    getProtections: () => protections,
    hideColumns() {},
    setFrozenRows() {},
  };
  const spreadsheet = {
    getSheetByName: (name) => name === "Solicitări" ? sheet : null,
    insertSheet: () => sheet,
  };
  const context = {
    Date,
    Intl,
    JSON,
    Math,
    Number,
    Object,
    Array,
    String,
    RegExp,
    isNaN,
    PropertiesService: { getScriptProperties: () => ({
      getProperty: (key) => ({ REGISTRY_SHARED_SECRET: sharedSecret, REGISTRY_SPREADSHEET_ID: "sheet-id" })[key] || null,
    }) },
    Utilities: {
      computeHmacSha256Signature: (text, key) => Array.from(createHmac("sha256", key).update(text).digest(), (byte) => byte > 127 ? byte - 256 : byte),
      getUuid: () => `request-${++uuid}`,
    },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
    SpreadsheetApp: { ProtectionType: { RANGE: "RANGE" }, openById: () => spreadsheet },
    ContentService: {
      MimeType: { JSON: "application/json" },
      createTextOutput(text) { return { getContent: () => text, setMimeType() { return this; } }; },
    },
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return { context, grid, sheet, writes };
}

function booking(overrides = {}) {
  return {
    triggerEvent: "BOOKING_CREATED",
    eventCreatedAt: "2026-10-13T10:00:00.000Z",
    uid: "booking-old",
    eventTypeId: 771,
    organizerUsername: "santiersyncro",
    name: "Ana Pop",
    email: "ana@example.test",
    company: "=IMPORTXML(\"https://example.test\",\"//secret\")",
    startTime: "2026-10-20T10:00:00.000Z",
    endTime: "2026-10-20T10:30:00.000Z",
    requestHandling: "Mesaje răspândite\nîn mai multe locuri",
    timeBottleneck: "Centralizarea solicitărilor",
    bookingStatus: "Programată",
    ...overrides,
  };
}

function post(context, event, overrides = {}) {
  const issuedAt = new Date().toISOString();
  const data = JSON.stringify(event);
  const signature = createHmac("sha256", sharedSecret).update(`${issuedAt}.${data}`).digest("hex");
  const envelope = { issuedAt, data, signature, ...overrides };
  const output = context.doPost({ postData: { contents: JSON.stringify(envelope) } });
  return JSON.parse(output.getContent());
}

test("authenticates envelopes and rejects tampering or expired delivery", () => {
  const { context } = makeAppsScript();
  const issuedAt = new Date().toISOString();
  const data = JSON.stringify(booking());
  const signature = createHmac("sha256", sharedSecret).update(`${issuedAt}.${data}`).digest("hex");
  const good = context.doPost({ postData: { contents: JSON.stringify({ issuedAt, data, signature }) } });
  assert.equal(JSON.parse(good.getContent()).ok, true);

  const forged = context.doPost({ postData: { contents: JSON.stringify({ issuedAt, data: data + " ", signature }) } });
  assert.equal(JSON.parse(forged.getContent()).ok, false);
  const expiredAt = "2020-01-01T00:00:00.000Z";
  const expiredSignature = createHmac("sha256", sharedSecret).update(`${expiredAt}.${data}`).digest("hex");
  const expired = context.doPost({ postData: { contents: JSON.stringify({ issuedAt: expiredAt, data, signature: expiredSignature }) } });
  assert.equal(JSON.parse(expired.getContent()).code, "expired");
});

test("upserts once, preserves human columns, reschedules the row, and ignores an old cancellation", () => {
  const { context, grid, writes } = makeAppsScript();
  assert.equal(post(context, booking()).result, "created");
  assert.equal(grid.length, 2);
  assert.equal(grid[1][6], "'=IMPORTXML(\"https://example.test\",\"//secret\")");

  grid[1][12] = "În lucru";
  grid[1][13] = "Sună clientul";
  grid[1][14] = "2026-10-21";
  grid[1][15] = "Mara";
  grid[1][16] = "Notă adăugată manual";
  assert.equal(post(context, booking()).result, "ignored-old-event");
  assert.equal(grid.length, 2);
  writes.length = 0;

  const rescheduled = booking({
    triggerEvent: "BOOKING_RESCHEDULED",
    eventCreatedAt: "2026-10-13T10:02:00.000Z",
    uid: "booking-new",
    previousUid: "booking-old",
    bookingStatus: "Reprogramată",
    startTime: "2026-10-21T11:00:00.000Z",
  });
  assert.equal(post(context, rescheduled).result, "updated");
  assert.deepEqual(writes, [
    { row: 2, col: 1, rowCount: 1, colCount: 12 },
    { row: 2, col: 18, rowCount: 1, colCount: 3 },
  ]);
  assert.equal(grid.length, 2);
  assert.equal(grid[1][1], "booking-new");
  assert.match(grid[1][18], /booking-old/);
  assert.equal(grid[1][12], "În lucru");
  assert.equal(grid[1][13], "Sună clientul");
  assert.equal(grid[1][14], "2026-10-21");
  assert.equal(grid[1][15], "Mara");
  assert.equal(grid[1][16], "Notă adăugată manual");

  const cancelledOld = booking({
    triggerEvent: "BOOKING_CANCELLED",
    eventCreatedAt: "2026-10-13T10:03:00.000Z",
    bookingStatus: "Anulată",
  });
  assert.equal(post(context, cancelledOld).result, "ignored-stale-cancellation");
  assert.equal(grid[1][1], "booking-new");
  assert.equal(grid[1][9], "Reprogramată");
});

test("rejects unknown fields and missing required answers on a newly seen reschedule", () => {
  const { context } = makeAppsScript();
  assert.equal(post(context, booking({ unexpectedRawPayload: "must not reach the sheet" })).ok, false);
  assert.equal(post(context, booking({
    triggerEvent: "BOOKING_RESCHEDULED",
    uid: "unknown-rescheduled-booking",
    previousUid: "not-in-registry",
    bookingStatus: "Reprogramată",
    requestHandling: undefined,
    timeBottleneck: undefined,
  })).ok, false);
});
