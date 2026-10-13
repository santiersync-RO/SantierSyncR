import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const filename = new URL("../.env.local", import.meta.url);
const privateFilename = new URL("../.env.booking.local", import.meta.url);
const privateSource = await readFile(privateFilename, "utf8").catch((error) => {
  if (error.code === "ENOENT") return "";
  throw error;
});
const spreadsheetId = process.env.REGISTRY_SPREADSHEET_ID?.trim() ||
  privateSource.match(/^REGISTRY_SPREADSHEET_ID=(.*)$/m)?.[1]?.trim() || "";
if (!/^[A-Za-z0-9_-]{20,}$/.test(spreadsheetId)) {
  throw new Error("Setează REGISTRY_SPREADSHEET_ID cu ID-ul registrului privat înainte de pregătire.");
}
const source = await readFile(filename, "utf8").catch((error) => {
  if (error.code === "ENOENT") return "";
  throw error;
});
function existing(name) {
  return source.match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]?.trim().replace(/^"(.*)"$/, "$1") || "";
}
function secret(name) {
  const value = existing(name);
  if (value && !/^[a-f0-9]{64}$/i.test(value)) throw new Error(`${name}: valoarea existentă necesită verificare; nu a fost suprascrisă.`);
  return value || randomBytes(32).toString("hex");
}
const values = {
  BOOKING_ENABLED: existing("BOOKING_ENABLED") || "false",
  CALCOM_EVENT_URL: "https://cal.com/santiersyncro/30min",
  CALCOM_EVENT_TYPE_ID: "7459353",
  CALCOM_ORGANIZER_USERNAME: "santiersyncro",
  // Confirmed by provider settings and public event API on 2026-10-13.
  CALCOM_REQUIRED_QUESTIONS_CONFIRMED: "true",
  CALCOM_WEBHOOK_ENABLED: existing("CALCOM_WEBHOOK_ENABLED") || "false",
  CALCOM_WEBHOOK_SECRET: secret("CALCOM_WEBHOOK_SECRET"),
  REGISTRY_ENDPOINT_URL: existing("REGISTRY_ENDPOINT_URL"),
  REGISTRY_SHARED_SECRET: secret("REGISTRY_SHARED_SECRET"),
};
let output = source;
for (const [name, value] of Object.entries(values)) {
  const pattern = new RegExp(`^${name}=.*(?:\\r?\\n|$)`, "gm");
  output = output.replace(pattern, "");
  output += `${output.endsWith("\n") || !output ? "" : "\n"}${name}=${value}\n`;
}
await writeFile(filename, output, { mode: 0o600 });
await writeFile(privateFilename, [
  "# Configurare privată — nu trimite conținutul în chat sau GitHub.",
  `CALCOM_WEBHOOK_SECRET=${values.CALCOM_WEBHOOK_SECRET}`,
  `REGISTRY_SHARED_SECRET=${values.REGISTRY_SHARED_SECRET}`,
  `REGISTRY_SPREADSHEET_ID=${spreadsheetId}`,
].join("\n") + "\n", { mode: 0o600 });
console.log("Configurația locală și cele două chei au fost pregătite în fișiere .env ignorate de Git. Valorile nu sunt afișate.");
