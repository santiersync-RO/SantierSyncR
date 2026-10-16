import { NextResponse } from "next/server";
import { isAllowedCalcomSource, parseCalcomWebhook, verifyCalcomSignature } from "@/lib/calcom-webhook";
import { sendBookingToRegistry } from "@/lib/booking-registry.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 128 * 1024;
const BODY_READ_TIMEOUT_MS = 8_000;

type BodyReadResult =
  | { ok: true; text: string }
  | { ok: false; reason: "too_large" | "timeout" | "invalid" };

function reply(status: number, body?: { ok?: boolean; code?: string }) {
  return new NextResponse(body ? JSON.stringify(body) : null, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      ...(body ? { "Content-Type": "application/json; charset=utf-8" } : {}),
    },
  });
}

async function readBoundedBody(request: Request): Promise<BodyReadResult> {
  if (!request.body) return { ok: true, text: "" };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  const timedOut = new Error("body read timed out");
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timeoutHandle = setTimeout(() => {
      void reader.cancel().catch(() => undefined);
      reject(timedOut);
    }, BODY_READ_TIMEOUT_MS);
  });
  try {
    while (true) {
      const { done, value } = await Promise.race([reader.read(), timeout]);
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, reason: "too_large" };
      }
      chunks.push(value);
    }
  } catch (error) {
    return { ok: false, reason: error === timedOut ? "timeout" : "invalid" };
  } finally {
    if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
    try { reader.releaseLock(); } catch { /* canceled stream */ }
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return { ok: true, text: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

export async function POST(request: Request) {
  if (process.env.CALCOM_WEBHOOK_ENABLED?.trim().toLowerCase() !== "true") {
    return reply(503, { code: "unavailable" });
  }
  const secret = process.env.CALCOM_WEBHOOK_SECRET?.trim() ?? "";
  const eventTypeId = Number(process.env.CALCOM_EVENT_TYPE_ID);
  const organizerUsername = process.env.CALCOM_ORGANIZER_USERNAME?.trim().toLowerCase() ?? "";
  if (secret.length < 32 || !Number.isSafeInteger(eventTypeId) || eventTypeId <= 0 || !organizerUsername) {
    return reply(503, { code: "unavailable" });
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > MAX_BODY_BYTES) {
    return reply(413, { code: "too_large" });
  }
  const body = await readBoundedBody(request).catch((): BodyReadResult => ({ ok: false, reason: "invalid" }));
  if (!body.ok) {
    if (body.reason === "too_large") return reply(413, { code: "too_large" });
    if (body.reason === "timeout") return reply(408, { code: "timeout" });
    return reply(400, { code: "invalid" });
  }
  const rawBody = body.text;
  if (!rawBody) return reply(400, { code: "invalid" });
  if (!verifyCalcomSignature(rawBody, request.headers.get("x-cal-signature-256"), secret)) {
    return reply(401, { code: "signature" });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(rawBody);
  } catch {
    return reply(400, { code: "invalid" });
  }
  const parsed = parseCalcomWebhook(raw);
  if (parsed.kind === "unsupported") return reply(204);
  if (parsed.kind === "invalid") return reply(400, { code: "invalid" });
  if (!isAllowedCalcomSource(parsed.event, eventTypeId, organizerUsername)) {
    return reply(401, { code: "source" });
  }

  const result = await sendBookingToRegistry(parsed.event);
  if (result !== "ok") return reply(result === "unavailable" ? 503 : 502, { code: "registry" });
  return reply(204);
}
