import { createHmac, timingSafeEqual } from "node:crypto";

export type BookingStatus = "Programată" | "Reprogramată" | "Anulată" | "În așteptare" | "Respinsă";

export type BookingRegistryEvent = {
  triggerEvent: string;
  eventCreatedAt: string;
  uid: string;
  previousUid?: string;
  eventTypeId: number;
  organizerUsername: string;
  name?: string;
  email?: string;
  company?: string;
  startTime?: string;
  endTime?: string;
  requestHandling?: string;
  timeBottleneck?: string;
  bookingStatus: BookingStatus;
};

export type WebhookParseResult =
  | { kind: "supported"; event: BookingRegistryEvent }
  | { kind: "unsupported" }
  | { kind: "invalid" };

const MAX_ANSWER = 1500;
const MAX_NAME = 200;
const MAX_EMAIL = 254;
const MAX_UID = 200;
const MAX_USERNAME = 100;
const REQUIRED_LABELS = {
  gestionare_cereri: "Cum gestionați acum cererile?",
  blocaj_timp: "Unde pierdeți cel mai mult timp?",
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedText(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  if (!text || text.length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text)) return undefined;
  return text;
}

function optionalText(value: unknown, max: number): string | undefined | null {
  if (value === undefined || value === null || value === "") return undefined;
  return boundedText(value, max) ?? null;
}

function isoDate(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 40 || Number.isNaN(Date.parse(value))) return undefined;
  const date = new Date(value);
  if (!value.includes("T")) return undefined;
  return date.toISOString();
}

function eventStatus(trigger: string): BookingStatus | undefined {
  switch (trigger) {
    case "BOOKING_CREATED": return "Programată";
    case "BOOKING_RESCHEDULED": return "Reprogramată";
    case "BOOKING_CANCELLED": return "Anulată";
    case "BOOKING_REQUESTED": return "În așteptare";
    case "BOOKING_REJECTED": return "Respinsă";
    default: return undefined;
  }
}

function responseValue(responses: unknown, id: string, expectedLabel: string): string | undefined | null {
  if (!isRecord(responses)) return undefined;
  const field = responses[id];
  if (field === undefined) return undefined;
  if (!isRecord(field) || field.label !== expectedLabel) return null;
  return optionalText(field.value, MAX_ANSWER);
}

export function parseCalcomWebhook(raw: unknown): WebhookParseResult {
  if (!isRecord(raw)) return { kind: "invalid" };
  if (typeof raw.triggerEvent !== "string" || typeof raw.createdAt !== "string" || !isRecord(raw.payload)) {
    return { kind: "invalid" };
  }
  const status = eventStatus(raw.triggerEvent);
  if (!status) return { kind: "unsupported" };

  const payload = raw.payload;
  const uid = boundedText(payload.uid, MAX_UID);
  const eventCreatedAt = isoDate(raw.createdAt);
  const eventTypeId = payload.eventTypeId;
  const organizer = payload.organizer;
  if (!uid || !eventCreatedAt || !Number.isSafeInteger(eventTypeId) || Number(eventTypeId) <= 0 || !isRecord(organizer)) {
    return { kind: "invalid" };
  }
  const organizerUsername = boundedText(organizer.username, MAX_USERNAME)?.toLowerCase();
  if (!organizerUsername || !/^[a-z0-9._-]+$/.test(organizerUsername)) return { kind: "invalid" };

  const previousUid = optionalText(payload.rescheduleUid, MAX_UID);
  if (previousUid === null || (previousUid && previousUid === uid)) return { kind: "invalid" };

  const attendees = Array.isArray(payload.attendees) ? payload.attendees : [];
  if (attendees.length > 20) return { kind: "invalid" };
  const attendee = attendees.find((candidate) => isRecord(candidate) && candidate.email !== undefined);
  const attendeeRecord = isRecord(attendee) ? attendee : undefined;
  const name = attendeeRecord ? optionalText(attendeeRecord.name, MAX_NAME) : undefined;
  const email = attendeeRecord ? optionalText(attendeeRecord.email, MAX_EMAIL) : undefined;
  if (name === null || email === null) return { kind: "invalid" };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { kind: "invalid" };

  const company = optionalText(payload.responses && isRecord(payload.responses) && isRecord(payload.responses.firma)
    ? payload.responses.firma.value : undefined, MAX_NAME);
  const requestHandling = responseValue(payload.responses, "gestionare_cereri", REQUIRED_LABELS.gestionare_cereri);
  const timeBottleneck = responseValue(payload.responses, "blocaj_timp", REQUIRED_LABELS.blocaj_timp);
  if (company === null || requestHandling === null || timeBottleneck === null) return { kind: "invalid" };

  if ((raw.triggerEvent === "BOOKING_CREATED" || raw.triggerEvent === "BOOKING_REQUESTED") &&
      (!requestHandling?.trim() || !timeBottleneck?.trim() || !name || !email)) return { kind: "invalid" };

  const startTime = payload.startTime === undefined ? undefined : isoDate(payload.startTime);
  const endTime = payload.endTime === undefined ? undefined : isoDate(payload.endTime);
  if ((payload.startTime !== undefined && !startTime) || (payload.endTime !== undefined && !endTime)) return { kind: "invalid" };
  if ((raw.triggerEvent === "BOOKING_CREATED" || raw.triggerEvent === "BOOKING_REQUESTED") &&
      (!startTime || !endTime || Date.parse(endTime) <= Date.parse(startTime))) return { kind: "invalid" };

  return {
    kind: "supported",
    event: {
      triggerEvent: raw.triggerEvent,
      eventCreatedAt,
      uid,
      ...(previousUid ? { previousUid } : {}),
      eventTypeId: Number(eventTypeId),
      organizerUsername,
      ...(name ? { name } : {}),
      ...(email ? { email: email.toLowerCase() } : {}),
      ...(company ? { company } : {}),
      ...(startTime ? { startTime } : {}),
      ...(endTime ? { endTime } : {}),
      ...(requestHandling ? { requestHandling } : {}),
      ...(timeBottleneck ? { timeBottleneck } : {}),
      bookingStatus: status,
    },
  };
}

export function verifyCalcomSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature || !/^[a-f0-9]{64}$/i.test(signature) || !secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest();
  const received = Buffer.from(signature, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export function isAllowedCalcomSource(event: BookingRegistryEvent, eventTypeId: number, organizerUsername: string): boolean {
  return event.eventTypeId === eventTypeId && event.organizerUsername === organizerUsername.trim().toLowerCase();
}

export function signRegistryEnvelope(issuedAt: string, data: string, secret: string): string {
  return createHmac("sha256", secret).update(`${issuedAt}.${data}`, "utf8").digest("hex");
}
