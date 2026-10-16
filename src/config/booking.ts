import "server-only";

function enabledFlag(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

function validEventUrl(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "cal.com" || url.port ||
        url.username || url.password || url.search || url.hash ||
        !/^\/santiersyncro\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname)) return "";
    return url.toString().replace(/\/$/, "");
  } catch { return ""; }
}

const eventUrl = validEventUrl(process.env.CALCOM_EVENT_URL?.trim() || "https://cal.com/santiersyncro/30min");
const configuredEventId = Number(process.env.CALCOM_EVENT_TYPE_ID);
const registryUrl = process.env.REGISTRY_ENDPOINT_URL?.trim() || "";
const registryConfigured =
  /^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(registryUrl) &&
  (process.env.REGISTRY_SHARED_SECRET?.trim().length ?? 0) >= 32;
const webhookConfigured =
  enabledFlag(process.env.CALCOM_WEBHOOK_ENABLED) &&
  (process.env.CALCOM_WEBHOOK_SECRET?.trim().length ?? 0) >= 32 &&
  Number.isSafeInteger(configuredEventId) && configuredEventId > 0 &&
  process.env.CALCOM_ORGANIZER_USERNAME?.trim() === "santiersyncro";

export const bookingConfig = {
  // These flags attest real provider configuration.
  // A page view or iframe load never counts as a successful booking.
  enabled: enabledFlag(process.env.BOOKING_ENABLED) && Boolean(eventUrl) &&
    enabledFlag(process.env.CALCOM_REQUIRED_QUESTIONS_CONFIRMED) &&
    registryConfigured && webhookConfigured,
  eventUrl,
  calLink: eventUrl,
  durationMinutes: 30,
  questions: [
    { id: "gestionare_cereri", label: "Cum gestionați acum cererile?" },
    { id: "blocaj_timp", label: "Unde pierdeți cel mai mult timp?" },
  ],
} as const;
