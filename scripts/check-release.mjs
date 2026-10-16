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

function validateContactConfiguration(env, failures) {
  const contactRequested = isTrue(env.CONTACT_ENABLED) || isTrue(env.NEXT_PUBLIC_CONTACT_ENABLED);
  if (!contactRequested) return false;

  for (const name of ["CONTACT_ENABLED", "NEXT_PUBLIC_CONTACT_ENABLED"]) {
    if (!isTrue(env[name])) failures.push(`${name} trebuie setat la true împreună cu celălalt flag pentru a activa contactul.`);
  }
  for (const name of ["RESEND_API_KEY", "TURNSTILE_SECRET_KEY", "NEXT_PUBLIC_TURNSTILE_SITE_KEY"]) {
    if (!hasValue(name) || isPlaceholder(env[name])) failures.push(`${name} este necesar și trebuie să fie configurat real când contactul este activat.`);
  }
  const turnstileHostnames = (env.TURNSTILE_ALLOWED_HOSTNAMES ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  if (!turnstileHostnames.length) failures.push("TURNSTILE_ALLOWED_HOSTNAMES trebuie configurat când contactul este activat.");
  if (!isEmail(env.CONTACT_TO_EMAIL) || isPlaceholder(env.CONTACT_TO_EMAIL)) {
    failures.push("CONTACT_TO_EMAIL trebuie să fie o adresă reală și validă când contactul este activat.");
  }
  if (!/^[^\s@]+@(?:[a-z0-9-]+\.)*santiersync\.ro$/i.test(env.CONTACT_FROM_EMAIL ?? "") || isPlaceholder(env.CONTACT_FROM_EMAIL)) {
    failures.push("CONTACT_FROM_EMAIL trebuie să folosească domeniul santiersync.ro verificat când contactul este activat.");
  }
  const origins = (env.CONTACT_ALLOWED_ORIGINS ?? "").split(",").map((origin) => origin.trim()).filter(Boolean);
  if (!origins.length || origins.some((origin) => {
    try {
      const parsed = new URL(origin);
      return parsed.origin !== origin || (parsed.protocol !== "https:" && parsed.hostname !== "localhost");
    } catch { return true; }
  })) failures.push("CONTACT_ALLOWED_ORIGINS trebuie să conțină numai origini HTTPS valide.");

  if (env.VERCEL_ENV === "production") {
    if (turnstileHostnames.length !== 1 || turnstileHostnames[0] !== "santiersync.ro") {
      failures.push("TURNSTILE_ALLOWED_HOSTNAMES trebuie să conțină doar santiersync.ro în producție.");
    }
    if (origins.length !== 1 || origins[0] !== "https://santiersync.ro") {
      failures.push("CONTACT_ALLOWED_ORIGINS trebuie să conțină doar https://santiersync.ro în producție.");
    }
    if (!isTrue(env.SENDER_DOMAIN_VERIFIED)) failures.push("SENDER_DOMAIN_VERIFIED trebuie activat după verificarea domeniului expeditor în Resend.");
  }
  return true;
}

if (!productionCheck) {
  console.log("Verificare de lansare omisă: mediul nu este setat pentru producție.");
  process.exit(0);
}

if (isTrue(env.PUBLIC_INDEXING_ENABLED) &&
    (env.VERCEL_ENV !== "production" || env.SITE_URL?.trim() !== "https://santiersync.ro")) {
  failures.push("PUBLIC_INDEXING_ENABLED cere VERCEL_ENV=production și SITE_URL exact https://santiersync.ro.");
}

const deploymentStage = env.DEPLOYMENT_STAGE?.trim().toLowerCase() || "live";
if (!new Set(["demo", "live"]).has(deploymentStage)) {
  failures.push("DEPLOYMENT_STAGE trebuie să fie demo sau live (gol păstrează verificările stricte live).");
}

const contactRequested = validateContactConfiguration(env, failures);

if (deploymentStage === "demo") {
  if (env.SITE_URL?.trim() !== "https://santiersync.ro") {
    failures.push("Pentru demo, SITE_URL trebuie să fie exact https://santiersync.ro.");
  }
  if (failures.length) {
    console.error("Configurarea pentru demo este blocată:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log("Configurația tehnică pentru demo a trecut. Acest rezultat nu confirmă eligibilitatea planului de hosting, DNS-ul sau verificarea manuală.");
  process.exit(0);
}

if (deploymentStage !== "live") {
  console.error("Publicarea live este blocată: DEPLOYMENT_STAGE nu este valid.");
  process.exit(1);
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
if (failures.length) {
  console.error("Publicarea de producție este blocată:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(contactRequested
  ? "Configurația de producție cu API-ul de contact activat a trecut verificările obligatorii."
  : "Configurația de producție cu e-mail de contact pregătit a trecut verificările obligatorii.");
