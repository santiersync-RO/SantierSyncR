import { NextResponse } from "next/server";
import { z } from "zod";
import { contactSchema } from "@/lib/contact-schema";
import { sendContactEmail } from "@/lib/email.server";
import { verifyTurnstile } from "@/lib/turnstile.server";
import { siteConfig } from "@/config/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;
const requestIdSchema = z.string().uuid();
const envelopeSchema = z
  .object({
    ...contactSchema.shape,
    requestId: requestIdSchema,
    website: z.string().max(500),
    turnstileToken: z.string().min(1).max(2048),
  })
  .strict();

function json(status: number, payload: Record<string, string | boolean>) {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0", "X-Content-Type-Options": "nosniff" },
  });
}

async function readBody(request: Request): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const joined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(joined);
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  if (!siteConfig.contactEnabled || process.env.CONTACT_ENABLED !== "true") {
    return json(503, { code: "unavailable", message: "Trimiterea prin formular nu este disponibilă momentan." });
  }

  const origins = (process.env.CONTACT_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (origins.length === 0) {
    return json(503, { code: "unavailable", message: "Trimiterea prin formular nu este disponibilă momentan." });
  }
  const origin = request.headers.get("origin");
  if (!origin || !origins.includes(origin)) {
    return json(403, { code: "origin", message: "Nu am putut verifica sursa solicitării. Reîncarcă pagina și încearcă din nou." });
  }

  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return json(415, { code: "content_type", message: "Formatul solicitării nu este acceptat." });
  }
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return json(413, { code: "too_large", message: "Solicitarea este prea mare. Scurtează mesajul și încearcă din nou." });
  }

  const bodyText = await readBody(request).catch(() => "");
  if (bodyText === null) {
    return json(413, { code: "too_large", message: "Solicitarea este prea mare. Scurtează mesajul și încearcă din nou." });
  }
  let raw: unknown;
  try {
    raw = JSON.parse(bodyText);
  } catch {
    return json(400, { code: "invalid", message: "Verifică informațiile completate și încearcă din nou." });
  }

  const parsed = envelopeSchema.safeParse(raw);
  if (!parsed.success) {
    return json(400, { code: "invalid", message: "Verifică informațiile completate și încearcă din nou." });
  }
  const { requestId, website, turnstileToken, ...fields } = parsed.data;
  const validRequestId = requestIdSchema.safeParse(requestId);
  const form = contactSchema.safeParse(fields);
  if (!validRequestId.success || !form.success) {
    return json(400, { code: "invalid", message: "Verifică informațiile completate și încearcă din nou." });
  }
  if (website.trim().length > 0) {
    return json(400, { code: "invalid", message: "Verifică informațiile completate și încearcă din nou." });
  }

  const verification = await verifyTurnstile(turnstileToken);
  if (!verification.ok) {
    return verification.reason === "unavailable"
      ? json(503, { code: "unavailable", message: `Nu am putut verifica protecția anti-spam. Încearcă din nou sau scrie-ne la ${siteConfig.publicEmail}.` })
      : json(403, { code: "verification", message: "Verificarea anti-spam a expirat. Încearcă din nou." });
  }

  const result = await sendContactEmail(form.data, requestId);
  if (!result.ok) {
    return json(503, { code: "unavailable", message: `Nu am putut trimite mesajul. Încearcă din nou sau scrie-ne la ${siteConfig.publicEmail}.` });
  }
  return json(200, { ok: true, message: "Mesajul tău a fost trimis. Vom reveni la adresa de email indicată pentru a discuta despre proces." });
}
