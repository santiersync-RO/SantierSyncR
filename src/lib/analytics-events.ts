export type SiteEventName = "calendar_open" | "contact_submit_success";

const ALLOWED_EVENTS = new Set<SiteEventName>([
  "calendar_open",
  "contact_submit_success",
]);

const CANONICAL_ORIGIN = "https://santiersync.ro";
const ALLOWED_PATHS = new Set(["/", "/programare"]);

type CMP = (
  command: string,
  parameter?: unknown,
  callback?: ((value: unknown) => void) | null,
  async?: boolean,
) => unknown;

type AnalyticsWindow = Window & {
  __cmp?: CMP;
  __santierSyncGaInitialized?: string;
  gtag?: (...args: unknown[]) => void;
  [key: `ga-disable-${string}`]: boolean | undefined;
};

function hasAnalyticsConsent(cmp: CMP): boolean {
  try {
    const cmpData = cmp("getCMPData") as { vendorConsents?: Record<string, unknown> } | null;
    const status = cmp("consentStatus") as { consentExists?: unknown } | null;
    return status?.consentExists === true && cmpData?.vendorConsents?.s26 === true;
  } catch {
    return false;
  }
}

/** Sends a no-PII event only when the current CMP and GA state are ready. */
export function trackSiteEvent(eventName: SiteEventName): void {
  if (!ALLOWED_EVENTS.has(eventName)) return;
  if (typeof window === "undefined") return;

  const browser = window as AnalyticsWindow;
  if (browser.location.origin !== CANONICAL_ORIGIN) return;

  const measurementId = browser.__santierSyncGaInitialized;
  if (!measurementId || !/^G-[A-Z0-9]+$/.test(measurementId)) return;
  if (browser[`ga-disable-${measurementId}`] !== false) return;
  if (typeof browser.gtag !== "function") return;
  if (typeof browser.__cmp !== "function" || !hasAnalyticsConsent(browser.__cmp)) return;

  const path = browser.location.pathname;
  if (!ALLOWED_PATHS.has(path)) return;

  try {
    browser.gtag("event", eventName, {
      page_location: `${CANONICAL_ORIGIN}${path}`,
    });
  } catch {
    // Analytics must never affect the action that triggered it.
  }
}
