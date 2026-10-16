import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../integrations/google-sheets/Code.gs", import.meta.url), "utf8");
const secret = "registry-contact-test-secret-long-enough-000001";

function setup() {
  const sheets = new Map();
  let uuid = 0;
  function createSheet() {
    const grid = [];
    const sheet = {
      grid,
      getLastRow() { for (let i = grid.length - 1; i >= 0; i -= 1) if ((grid[i] || []).some((cell) => cell !== "" && cell !== undefined)) return i + 1; return 0; },
      getMaxRows: () => 100,
      getRange(row, col, rowCount = 1, colCount = 1) { return {
        getValues: () => Array.from({ length: rowCount }, (_, r) => Array.from({ length: colCount }, (_, c) => grid[row - 1 + r]?.[col - 1 + c] ?? "")),
        setValues(values) { values.forEach((line, r) => { grid[row - 1 + r] ??= []; line.forEach((value, c) => { grid[row - 1 + r][col - 1 + c] = value; }); }); },
        setFontWeight() { return this; }, protect() { return { setDescription() {}, setWarningOnly() {}, getEditors: () => [], removeEditors() {}, canDomainEdit: () => false, setDomainEdit() {} }; },
      }; },
      setFrozenRows() {}, hideColumns() {}, getProtections: () => [],
    };
    return sheet;
  }
  const spreadsheet = {
    getSheetByName(name) { return sheets.get(name) ?? null; },
    insertSheet(name) { const sheet = createSheet(); sheets.set(name, sheet); return sheet; },
  };
  const context = {
    Date, Intl, JSON, Math, Number, Object, Array, String, RegExp, isNaN,
    PropertiesService: { getScriptProperties: () => ({ getProperty: (key) => ({ REGISTRY_SHARED_SECRET: secret, REGISTRY_SPREADSHEET_ID: "sheet-id" })[key] ?? null }) },
    Utilities: { computeHmacSha256Signature: (text, key) => Array.from(createHmac("sha256", key).update(text).digest(), (byte) => byte > 127 ? byte - 256 : byte), getUuid: () => `uuid-${++uuid}` },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
    SpreadsheetApp: { ProtectionType: { RANGE: "RANGE" }, openById: () => spreadsheet },
    ContentService: { MimeType: { JSON: "application/json" }, createTextOutput(text) { return { getContent: () => text, setMimeType() { return this; } }; } },
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return { context, sheets };
}

const event = (overrides = {}) => ({
  type: "CONTACT_SUBMITTED", requestId: "a".repeat(64), providerId: "b".repeat(64),
  createdAt: "2026-10-16T10:00:00.000Z", name: "Ana Pop", email: "ana@example.test",
  company: "", message: "Aș dori să discutăm despre organizarea cererilor.", ...overrides,
});

function post(context, data) {
  const issuedAt = new Date().toISOString();
  const serialized = JSON.stringify(data);
  const signature = createHmac("sha256", secret).update(`${issuedAt}.${serialized}`).digest("hex");
  const response = context.doPost({ postData: { contents: JSON.stringify({ issuedAt, data: serialized, signature }) } });
  return JSON.parse(response.getContent());
}

test("contact events go to their own sheet and deduplicate stable request IDs", () => {
  const { context, sheets } = setup();
  assert.equal(post(context, event()).result, "created");
  assert.equal(post(context, event()).result, "duplicate");
  assert.equal(sheets.has("Solicitări"), false);
  const sheet = sheets.get("Mesaje contact");
  assert.equal(sheet.grid.length, 2);
  assert.equal(sheet.grid[1][2], "Ana Pop");
  assert.equal(sheet.grid[1][5], "Aș dori să discutăm despre organizarea cererilor.");
});

test("contact registry rejects invalid fields and escapes spreadsheet formulas", () => {
  const { context, sheets } = setup();
  assert.equal(post(context, event({ email: "not-an-email" })).ok, false);
  assert.equal(sheets.has("Mesaje contact"), false);
  assert.equal(post(context, event({ message: "=IMPORTXML(\"https://example.test\",\"//x\")" })).result, "created");
  assert.equal(sheets.get("Mesaje contact").grid[1][5].startsWith("'=IMPORTXML"), true);
});
