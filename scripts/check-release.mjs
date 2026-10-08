import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());
const env = process.env;
const productionCheck = env.VERCEL_ENV === "production" || env.CHECK_PRODUCTION === "true";
const failures = [];
const isTrue = (value) => value?.trim().toLowerCase() === "true";
const hasValue = (name) => Boolean(env[name]?.trim());
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value ?? "");
const isPlaceholder = (value) =>
  !value?.trim() || /\[[^\]]+\]|\bTODO\b|de confirmat|de validat|de completat|placeholder|replace[-_ ]?me|your[-_ ]?(?:key|email|domain)|example\.com/i.test(value);

if (!productionCheck) {
  console.log("Verificare de lansare omisă: mediul nu este setat pentru producție.");
  process.exit(0);
}

if (env.SITE_URL?.trim() !== "https://santiersync.ro") {
  failures.push("SITE_URL trebuie să fie exact https://santiersync.ro.");
}
if (!isTrue(env.DOMAIN_CONFIRMED)) {
  failures.push("DOMAIN_CONFIRMED trebuie activat după verificarea domeniului, DNS-ului și HTTPS.");
}
if (!isTrue(env.LEGAL_REVIEWED)) {
  failures.push("LEGAL_REVIEWED trebuie activat numai după confirmarea informărilor și practicilor reale.");
}
for (const name of [
  "LEGAL_OPERATOR_NAME", "LEGAL_OPERATOR_ADDRESS", "LEGAL_LAST_UPDATED", "LEGAL_CONTACT_EMAIL",
  "LEGAL_REQUEST_BASIS", "LEGAL_SECURITY_BASIS", "LEGAL_RETENTION_POLICY", "LEGAL_PROCESSORS_POLICY", "LEGAL_STORAGE_POLICY",
]) {
  if (!hasValue(name)) failures.push(`${name} este obligatoriu.`);
  else if (isPlaceholder(env[name])) failures.push(`${name} conține încă un placeholder.`);
}
if (!["natural", "legal"].includes(env.LEGAL_OPERATOR_TYPE?.trim().toLowerCase() ?? "")) {
  failures.push("LEGAL_OPERATOR_TYPE trebuie să fie natural sau legal, după forma reală a operatorului.");
}
if (env.LEGAL_OPERATOR_TYPE?.trim().toLowerCase() === "legal") {
  for (const name of ["LEGAL_REGISTRATION_NUMBER", "LEGAL_TAX_ID"]) {
    if (!hasValue(name) || isPlaceholder(env[name])) failures.push(`${name} este obligatoriu și trebuie completat pentru operatorul de tip legal.`);
  }
}
for (const name of ["LEGAL_REGISTRATION_NUMBER", "LEGAL_TAX_ID"]) {
  if (hasValue(name) && isPlaceholder(env[name])) failures.push(`${name} nu poate conține placeholder.`);
}
if (!isEmail(env.LEGAL_CONTACT_EMAIL)) failures.push("LEGAL_CONTACT_EMAIL trebuie să fie o adresă validă.");
const legalDate = `${env.LEGAL_LAST_UPDATED}T00:00:00Z`;
if (!/^\d{4}-\d{2}-\d{2}$/.test(env.LEGAL_LAST_UPDATED ?? "") ||
    Number.isNaN(Date.parse(legalDate)) ||
    new Date(legalDate).toISOString().slice(0, 10) !== env.LEGAL_LAST_UPDATED) {
  failures.push("LEGAL_LAST_UPDATED trebuie să fie data revizuirii în format ISO YYYY-MM-DD.");
}
if (!isTrue(env.MAILBOX_TESTED)) {
  failures.push("MAILBOX_TESTED trebuie activat după verificarea mesajului pregătit și a unei trimiteri controlate din aplicația de e-mail către inbox.");
}
if (!isTrue(env.RELEASE_APPROVED)) {
  failures.push("RELEASE_APPROVED trebuie să fie true numai după aprobarea explicită a proprietarului.");
}
// The current public UI prepares mailto only. The dormant API must stay closed.
if (isTrue(env.CONTACT_ENABLED) || isTrue(env.NEXT_PUBLIC_CONTACT_ENABLED)) {
  failures.push("CONTACT_ENABLED și NEXT_PUBLIC_CONTACT_ENABLED trebuie să rămână false pentru versiunea cu e-mail pregătit. Activarea API necesită o integrare separată.");
}
if (failures.length) {
  console.error("Publicarea de producție este blocată:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Configurația de producție cu e-mail pregătit a trecut verificările obligatorii.");
