const REGISTRY_SHEET_NAME = "Solicitări";
const REGISTRY_HEADERS = [
  "ID solicitare", "UID rezervare", "Creată la", "Actualizare Cal.com", "Nume", "E-mail",
  "Firmă", "Întâlnire (București)", "Întâlnire UTC", "Status programare",
  "Cum gestionați acum cererile?", "Unde pierdeți cel mai mult timp?", "Status solicitare",
  "Următorul pas", "Termen următorul pas", "Responsabil", "Notițe", "Ultima sincronizare",
  "UID-uri asociate", "ID eveniment"
];
const REGISTRY_MAX_BODY = 32768;
const REGISTRY_MAX_AGE_MS = 5 * 60 * 1000;
const REGISTRY_STATUS = {
  BOOKING_CREATED: "Programată",
  BOOKING_RESCHEDULED: "Reprogramată",
  BOOKING_CANCELLED: "Anulată",
  BOOKING_REQUESTED: "În așteptare",
  BOOKING_REJECTED: "Respinsă"
};

function doGet() {
  return registryJson({ ok: true, service: "booking-registry" });
}

function doPost(e) {
  try {
    const body = e && e.postData && typeof e.postData.contents === "string" ? e.postData.contents : "";
    if (!body || body.length > REGISTRY_MAX_BODY) return registryJson({ ok: false, code: "invalid" });
    const envelope = JSON.parse(body);
    if (!isPlainObject(envelope) || typeof envelope.issuedAt !== "string" ||
        typeof envelope.data !== "string" || typeof envelope.signature !== "string" ||
        envelope.data.length > REGISTRY_MAX_BODY || !/^[a-f0-9]{64}$/i.test(envelope.signature)) {
      return registryJson({ ok: false, code: "invalid" });
    }
    const issuedAt = Date.parse(envelope.issuedAt);
    const now = Date.now();
    if (!Number.isFinite(issuedAt) || Math.abs(now - issuedAt) > REGISTRY_MAX_AGE_MS) {
      return registryJson({ ok: false, code: "expired" });
    }
    const properties = PropertiesService.getScriptProperties();
    const secret = properties.getProperty("REGISTRY_SHARED_SECRET") || "";
    const spreadsheetId = properties.getProperty("REGISTRY_SPREADSHEET_ID") || "";
    if (secret.length < 32 || !spreadsheetId) return registryJson({ ok: false, code: "unavailable" });
    const expected = Utilities.computeHmacSha256Signature(envelope.issuedAt + "." + envelope.data, secret);
    const expectedHex = bytesToHex(expected);
    if (!constantTimeHexEqual(expectedHex, envelope.signature.toLowerCase())) {
      return registryJson({ ok: false, code: "signature" });
    }

    const event = JSON.parse(envelope.data);
    if (isContactEvent(event)) {
      const lock = LockService.getScriptLock();
      if (!lock.tryLock(8000)) return registryJson({ ok: false, code: "busy" });
      try {
        return registryJson({ ok: true, result: upsertContactEvent(spreadsheetId, event) });
      } finally {
        lock.releaseLock();
      }
    }
    if (!validateRegistryEvent(event)) return registryJson({ ok: false, code: "invalid" });
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(8000)) return registryJson({ ok: false, code: "busy" });
    try {
      const result = upsertRegistryEvent(spreadsheetId, event, envelope.issuedAt);
      return registryJson({ ok: true, result: result });
    } finally {
      lock.releaseLock();
    }
  } catch (_error) {
    return registryJson({ ok: false, code: "unavailable" });
  }
}

function isContactEvent(event) {
  return isPlainObject(event) && event.type === "CONTACT_SUBMITTED";
}

function validateContactEvent(event) {
  const allowed = ["type", "requestId", "providerId", "createdAt", "name", "email", "company", "message"];
  return isContactEvent(event) && Object.keys(event).length === allowed.length &&
    Object.keys(event).every(function (key) { return allowed.indexOf(key) >= 0; }) &&
    /^[a-f0-9]{64}$/.test(event.requestId) && /^[a-f0-9]{64}$/.test(event.providerId) &&
    validDate(event.createdAt) && safeText(event.name, 120) && safeText(event.email, 254) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(event.email) &&
    (event.company === "" || safeText(event.company, 120)) && contactMessageText(event.message);
}

function contactMessageText(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 1500 && value.trim() === value &&
    !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
}

function upsertContactEvent(spreadsheetId, event) {
  if (!validateContactEvent(event)) throw new Error("Invalid contact event");
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const name = "Mesaje contact";
  const headers = ["ID solicitare", "Creată la", "Nume", "E-mail", "Firmă", "Mesaj"];
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
  const actual = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  if (headers.some(function (header, index) { return actual[index] !== header; })) throw new Error("Contact schema mismatch");
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    if (ids.some(function (row) { return row[0] === event.requestId; })) return "duplicate";
  }
  sheet.getRange(lastRow + 1, 1, 1, headers.length).setValues([[
    event.requestId, event.createdAt, safeCellValue(event.name), safeCellValue(event.email),
    safeCellValue(event.company), safeCellValue(event.message)
  ]]);
  return "created";
}

function registryJson(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function bytesToHex(bytes) {
  return bytes.map(function (value) {
    const byte = value < 0 ? value + 256 : value;
    return (byte < 16 ? "0" : "") + byte.toString(16);
  }).join("");
}

function constantTimeHexEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string" || left.length !== 64 || right.length !== 64) return false;
  let difference = 0;
  for (let index = 0; index < 64; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

function validateRegistryEvent(event) {
  if (!isPlainObject(event)) return false;
  const allowed = ["triggerEvent", "eventCreatedAt", "uid", "previousUid", "eventTypeId", "organizerUsername",
    "name", "email", "company", "startTime", "endTime", "requestHandling", "timeBottleneck", "bookingStatus"];
  if (Object.keys(event).some(function (key) { return allowed.indexOf(key) < 0; })) return false;
  if (!Object.prototype.hasOwnProperty.call(REGISTRY_STATUS, event.triggerEvent) ||
      REGISTRY_STATUS[event.triggerEvent] !== event.bookingStatus ||
      !validDate(event.eventCreatedAt) || !safeText(event.uid, 200) ||
      !Number.isSafeInteger(event.eventTypeId) || event.eventTypeId <= 0 ||
      !safeText(event.organizerUsername, 100)) return false;
  if (event.previousUid !== undefined && (!safeText(event.previousUid, 200) || event.previousUid === event.uid)) return false;
  if (event.name !== undefined && !safeText(event.name, 200)) return false;
  if (event.email !== undefined && (!safeText(event.email, 254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(event.email))) return false;
  if (event.company !== undefined && !safeText(event.company, 200)) return false;
  if (event.startTime !== undefined && !validDate(event.startTime)) return false;
  if (event.endTime !== undefined && !validDate(event.endTime)) return false;
  if (event.requestHandling !== undefined && !safeText(event.requestHandling, 1500)) return false;
  if (event.timeBottleneck !== undefined && !safeText(event.timeBottleneck, 1500)) return false;
  if ((event.triggerEvent === "BOOKING_CREATED" || event.triggerEvent === "BOOKING_REQUESTED") &&
      (!event.requestHandling || !event.timeBottleneck || !event.name || !event.email || !event.startTime || !event.endTime ||
       Date.parse(event.endTime) <= Date.parse(event.startTime))) return false;
  return true;
}

function safeText(value, maxLength) {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength && value.trim() === value &&
    !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
}

function validDate(value) {
  return typeof value === "string" && value.length <= 40 && value.indexOf("T") >= 0 && !isNaN(Date.parse(value));
}

function upsertRegistryEvent(spreadsheetId, event, issuedAt) {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  let sheet = spreadsheet.getSheetByName(REGISTRY_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(REGISTRY_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, REGISTRY_HEADERS.length).setValues([REGISTRY_HEADERS]);
    initializeRegistrySheet(sheet);
  }
  const header = sheet.getRange(1, 1, 1, REGISTRY_HEADERS.length).getValues()[0];
  if (REGISTRY_HEADERS.some(function (name, index) { return header[index] !== name; })) throw new Error("Registry schema mismatch");
  initializeRegistrySheet(sheet);

  const lastRow = sheet.getLastRow();
  const rows = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, REGISTRY_HEADERS.length).getValues() : [];
  const match = findRegistryRow(rows, event);
  if (match && event.triggerEvent === "BOOKING_CANCELLED" && rows[match.index][1] !== event.uid) {
    return "ignored-stale-cancellation";
  }
  if (match) {
    const priorUpdate = Date.parse(String(rows[match.index][3] || ""));
    if (Number.isFinite(priorUpdate) && Date.parse(event.eventCreatedAt) <= priorUpdate) return "ignored-old-event";
  }
  if (!match && (event.triggerEvent === "BOOKING_CANCELLED" || event.triggerEvent === "BOOKING_REJECTED")) return "ignored-missing-booking";
  if (!match && event.triggerEvent === "BOOKING_RESCHEDULED" && (!event.requestHandling || !event.timeBottleneck)) {
    throw new Error("Missing required answers for new reschedule row");
  }

  const now = new Date().toISOString();
  let row;
  let rowNumber;
  if (match) {
    rowNumber = match.index + 2;
    row = rows[match.index].slice();
  } else {
    rowNumber = lastRow + 1;
    row = new Array(REGISTRY_HEADERS.length).fill("");
    row[0] = Utilities.getUuid();
    row[2] = now;
    row[12] = "Nouă";
    row[13] = "Pregătește discuția inițială";
    row[15] = "ȘantierSync";
  }

  const priorUid = String(row[1] || "");
  const aliases = parseAliases(row[18]);
  if (priorUid && priorUid !== event.uid && aliases.indexOf(priorUid) < 0) aliases.push(priorUid);
  if (event.previousUid && aliases.indexOf(event.previousUid) < 0) aliases.push(event.previousUid);
  if (event.triggerEvent === "BOOKING_RESCHEDULED" && priorUid && priorUid !== event.uid && aliases.indexOf(priorUid) < 0) aliases.push(priorUid);
  row[1] = event.uid;
  row[3] = event.eventCreatedAt;
  if (event.name !== undefined) row[4] = event.name;
  if (event.email !== undefined) row[5] = event.email;
  if (event.company !== undefined) row[6] = event.company;
  if (event.startTime !== undefined) {
    row[7] = bucharestDate(event.startTime);
    row[8] = event.startTime;
  }
  row[9] = event.bookingStatus;
  if (event.requestHandling !== undefined) row[10] = event.requestHandling;
  if (event.timeBottleneck !== undefined) row[11] = event.timeBottleneck;
  row[17] = now;
  row[18] = aliases.slice(-20).join(";");
  row[19] = String(event.eventTypeId);
  if (match) {
    sheet.getRange(rowNumber, 1, 1, 12).setValues([row.slice(0, 12).map(safeCellValue)]);
    sheet.getRange(rowNumber, 18, 1, 3).setValues([row.slice(17, 20).map(safeCellValue)]);
  } else {
    sheet.getRange(rowNumber, 1, 1, REGISTRY_HEADERS.length).setValues([row.map(safeCellValue)]);
  }
  return match ? "updated" : "created";
}

function findRegistryRow(rows, event) {
  for (let index = 0; index < rows.length; index += 1) {
    const currentUid = String(rows[index][1] || "");
    const aliases = parseAliases(rows[index][18]);
    if (currentUid === event.uid || (event.previousUid && currentUid === event.previousUid)) return { index: index };
    if (aliases.indexOf(event.uid) >= 0 || (event.previousUid && aliases.indexOf(event.previousUid) >= 0)) return { index: index };
  }
  return null;
}

function parseAliases(value) {
  if (!value) return [];
  return String(value).split(";").map(function (item) { return item.trim(); }).filter(Boolean).slice(-20);
}

function safeCellValue(value) {
  if (typeof value !== "string") return value;
  const leading = value.replace(/^[\s\u0000-\u001f]+/, "");
  return /^[=+\-@]/.test(leading) ? "'" + value : value;
}

function bucharestDate(utcDate) {
  return new Intl.DateTimeFormat("ro-RO", {
    timeZone: "Europe/Bucharest", dateStyle: "medium", timeStyle: "short"
  }).format(new Date(utcDate));
}

function initializeRegistrySheet(sheet) {
  sheet.setFrozenRows(1);
  sheet.hideColumns(1, 4);
  sheet.hideColumns(9, 1);
  sheet.hideColumns(18, 3);
  sheet.getRange(1, 1, 1, REGISTRY_HEADERS.length).setFontWeight("bold");
  const existing = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
  [
    { start: 1, width: 4, description: "Coloane Cal.com gestionate A:D" },
    { start: 9, width: 1, description: "Coloana Cal.com gestionată I" },
    { start: 18, width: 3, description: "Coloane Cal.com gestionate R:T" },
    { start: 1, width: REGISTRY_HEADERS.length, description: "Antet registru ȘantierSync" }
  ].forEach(function (spec) {
    if (existing.some(function (protection) { return protection.getDescription() === spec.description; })) return;
    const row = spec.description === "Antet registru ȘantierSync" ? 1 : 1;
    const height = spec.description === "Antet registru ȘantierSync" ? 1 : sheet.getMaxRows();
    const protection = sheet.getRange(row, spec.start, height, spec.width).protect();
    protection.setDescription(spec.description);
    protection.setWarningOnly(false);
    const editors = protection.getEditors();
    if (editors.length) protection.removeEditors(editors);
    if (protection.canDomainEdit()) protection.setDomainEdit(false);
  });
}
