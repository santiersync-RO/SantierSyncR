import { siteConfig } from "@/config/site";

const env = process.env;

export const legalConfig = {
  operatorName: env.LEGAL_OPERATOR_NAME?.trim() || "[DENUMIREA OPERATORULUI — DE CONFIRMAT]",
  operatorType: env.LEGAL_OPERATOR_TYPE?.trim() || "[PERSOANĂ FIZICĂ SAU JURIDICĂ — DE CONFIRMAT]",
  operatorAddress: env.LEGAL_OPERATOR_ADDRESS?.trim() || "[ADRESA CERUTĂ PENTRU FORMA OPERATORULUI — DE CONFIRMAT]",
  registrationNumber: env.LEGAL_REGISTRATION_NUMBER?.trim() ?? "",
  taxId: env.LEGAL_TAX_ID?.trim() ?? "",
  lastUpdated: env.LEGAL_LAST_UPDATED?.trim() || "[DATA ACTUALIZĂRII — DE CONFIRMAT]",
  contactEmail: env.LEGAL_CONTACT_EMAIL?.trim() || siteConfig.publicEmail,
  requestBasis: env.LEGAL_REQUEST_BASIS?.trim() || "[TEMEIUL PENTRU RĂSPUNSUL LA SOLICITARE — DE VALIDAT]",
  securityBasis: env.LEGAL_SECURITY_BASIS?.trim() || "[TEMEIUL PENTRU SECURITATE — DE VALIDAT]",
  retentionPolicy: env.LEGAL_RETENTION_POLICY?.trim() || "[TERMEN ȘI REGULI DE PĂSTRARE — DE CONFIRMAT]",
  processorsPolicy:
    env.LEGAL_PROCESSORS_POLICY?.trim() ||
    "[FURNIZORI, ROLURI, LOCAȚII ȘI TRANSFERURI — DE CONFIRMAT]",
  storagePolicy: env.LEGAL_STORAGE_POLICY?.trim() || "[TEHNOLOGII ȘI STOCARE — DE AUDITAT]",
  reviewed: env.LEGAL_REVIEWED?.trim().toLowerCase() === "true" && siteConfig.legalReady,
  releaseReady: siteConfig.releaseReady,
} as const;

export const legalDraftNotice =
  "Informare provizorie, publicată pentru transparență. Identitatea operatorului și unele practici de prelucrare sunt încă în curs de verificare; această pagină nu este informarea finală. Detaliile lipsă vor fi publicate după confirmare.";
