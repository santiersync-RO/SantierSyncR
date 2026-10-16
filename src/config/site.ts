import { CANONICAL_SITE_URL, isPublicIndexingEnabled } from "./indexing-policy";

const env = process.env;

const configuredStage = env.DEPLOYMENT_STAGE?.trim().toLowerCase() || "live";
const deploymentStage = configuredStage === "demo" ? "demo" : "live";
const stageIsValid = configuredStage === "demo" || configuredStage === "live";

function isTrue(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

function isConfirmed(value: string | undefined): boolean {
  const normalized = value?.trim() ?? "";
  return Boolean(normalized) && !/\[[^\]]+\]|\bTODO\b|placeholder|de confirmat|de validat|de completat/i.test(normalized);
}

const siteUrl = env.SITE_URL?.trim() || "https://santiersync.ro";
const expectedOrigin = CANONICAL_SITE_URL;

const legalValues = {
  operatorName: env.LEGAL_OPERATOR_NAME?.trim() ?? "",
  operatorType: env.LEGAL_OPERATOR_TYPE?.trim().toLowerCase() ?? "",
  operatorAddress: env.LEGAL_OPERATOR_ADDRESS?.trim() ?? "",
  registrationNumber: env.LEGAL_REGISTRATION_NUMBER?.trim() ?? "",
  taxId: env.LEGAL_TAX_ID?.trim() ?? "",
  lastUpdated: env.LEGAL_LAST_UPDATED?.trim() ?? "",
  contactEmail: env.LEGAL_CONTACT_EMAIL?.trim() ?? "",
  requestBasis: env.LEGAL_REQUEST_BASIS?.trim() ?? "",
  securityBasis: env.LEGAL_SECURITY_BASIS?.trim() ?? "",
  retentionPolicy: env.LEGAL_RETENTION_POLICY?.trim() ?? "",
  processorsPolicy: env.LEGAL_PROCESSORS_POLICY?.trim() ?? "",
  storagePolicy: env.LEGAL_STORAGE_POLICY?.trim() ?? "",
};

const legalFieldsComplete =
  isConfirmed(legalValues.operatorName) &&
  ["natural", "legal"].includes(legalValues.operatorType) &&
  isConfirmed(legalValues.operatorAddress) &&
  (legalValues.operatorType !== "legal" ||
    (isConfirmed(legalValues.registrationNumber) && isConfirmed(legalValues.taxId))) &&
  (!legalValues.registrationNumber || isConfirmed(legalValues.registrationNumber)) &&
  (!legalValues.taxId || isConfirmed(legalValues.taxId)) &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(legalValues.contactEmail) &&
  isConfirmed(legalValues.contactEmail) &&
  isConfirmed(legalValues.requestBasis) &&
  isConfirmed(legalValues.securityBasis) &&
  isConfirmed(legalValues.retentionPolicy) &&
  isConfirmed(legalValues.processorsPolicy) &&
  isConfirmed(legalValues.storagePolicy) &&
  /^\d{4}-\d{2}-\d{2}$/.test(legalValues.lastUpdated) &&
  !Number.isNaN(Date.parse(`${legalValues.lastUpdated}T00:00:00Z`)) &&
  new Date(`${legalValues.lastUpdated}T00:00:00Z`).toISOString().slice(0, 10) === legalValues.lastUpdated;

const siteUrlIsConfirmed =
  (() => {
    try {
      const url = new URL(siteUrl);
      return url.protocol === "https:" && url.origin === expectedOrigin;
    } catch {
      return false;
    }
  })();

// Public indexing is intentionally independent from release and legal approval.
// It exposes only the existing public pages on the canonical production host.
const publicIndexingEnabled = isPublicIndexingEnabled(env);

const legalReady =
  legalFieldsComplete &&
  siteUrlIsConfirmed &&
  isTrue(env.DOMAIN_CONFIRMED) &&
  isTrue(env.LEGAL_REVIEWED);

const releaseReady =
  stageIsValid &&
  deploymentStage === "live" &&
  env.VERCEL_ENV === "production" &&
  isTrue(env.RELEASE_APPROVED) &&
  legalReady;

const contactRequested =
  isTrue(env.CONTACT_ENABLED) || isTrue(env.NEXT_PUBLIC_CONTACT_ENABLED);

const originList = (env.CONTACT_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const turnstileHostnames = (env.TURNSTILE_ALLOWED_HOSTNAMES ?? "")
  .split(",")
  .map((hostname) => hostname.trim())
  .filter(Boolean);
const fromEmail = env.CONTACT_FROM_EMAIL?.trim().toLowerCase() ?? "";
const fromDomain = fromEmail.split("@").at(-1) ?? "";

const contactConfigReady =
  isTrue(env.CONTACT_ENABLED) &&
  isTrue(env.NEXT_PUBLIC_CONTACT_ENABLED) &&
  isConfirmed(env.RESEND_API_KEY) &&
  (isConfirmed(env.TURNSTILE_SECRET_KEY) &&
    isConfirmed(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) &&
    turnstileHostnames.length > 0) &&
  (env.VERCEL_ENV !== "production" ||
    (turnstileHostnames.length === 1 && turnstileHostnames[0] === "santiersync.ro" &&
      originList.length === 1 && originList[0] === expectedOrigin &&
      isTrue(env.SENDER_DOMAIN_VERIFIED))) &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.CONTACT_TO_EMAIL ?? "") && isConfirmed(env.CONTACT_TO_EMAIL) &&
  /^[^\s@]+@(?:[a-z0-9-]+\.)*santiersync\.ro$/i.test(fromEmail) && isConfirmed(env.CONTACT_FROM_EMAIL) &&
  (fromDomain === "santiersync.ro" || fromDomain.endsWith(".santiersync.ro")) &&
  originList.length > 0 &&
  originList.every((origin) => {
    try {
      const parsed = new URL(origin);
      return parsed.origin === origin && (parsed.protocol === "https:" || parsed.hostname === "localhost");
    } catch {
      return false;
    }
  });

export const siteConfig = {
  brand: "ȘantierSync",
  publicEmail: "santiersync@gmail.com",
  location: "Cluj și împrejurimi",
  siteUrl,
  canonicalOrigin: expectedOrigin,
  publicIndexingEnabled,
  indexingReady: publicIndexingEnabled,
  deploymentStage,
  releaseReady,
  legalReady,
  contactEnabled: contactConfigReady,
  contactRequested,
} as const;

export const siteMetadata = {
  title: "ȘantierSync | Organizare și automatizare pentru construcții",
  description:
    "Organizare și automatizare pentru firme de construcții și instalații din Cluj și împrejurimi. Simplifică cererile de ofertă și munca administrativă.",
  openGraphTitle: "Organizare pentru construcții, în Cluj",
  openGraphDescription:
    "ȘantierSync ajută firmele de construcții și instalații din Cluj și împrejurimi să-și organizeze cererile și activitatea administrativă.",
} as const;

