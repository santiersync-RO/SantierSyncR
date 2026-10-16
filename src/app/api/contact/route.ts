import { NextResponse } from "next/server";
import { z } from "zod";
import { siteConfig } from "@/config/site";
import { contactSchema } from "@/lib/contact-schema";
import { sendContactEmail } from "@/lib/email.server";
import { sendContactToRegistry } from "@/lib/contact-registry.server";
import { verifyTurnstile } from "@/lib/turnstile.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BODY_BYTES = 16 * 1024;
const envelopeSchema = z.object({ ...contactSchema.shape, requestId: z.string().uuid(), website: z.string().max(500), turnstileToken: z.string().min(1).max(2048) }).strict();

function json(status: number, payload: Record<string, string | boolean>) {
  return NextResponse.json(payload, { status, headers: { "Cache-Control": "no-store, max-age=0", "X-Content-Type-Options": "nosniff" } });
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
      if (total > MAX_BODY_BYTES) { await reader.cancel().catch(() => undefined); return null; }
      chunks.push(value);
    }
  } finally { try { reader.releaseLock(); } catch { /* canceled */ } }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { return ""; }
}

export async function POST(request: Request) {
  if (!siteConfig.contactEnabled || process.env.CONTACT_ENABLED?.trim().toLowerCase() !== "true") return json(503, { code: "unavailable", message: `Trimiterea nu este disponibilă momentan. Scrie-ne la ${siteConfig.publicEmail}.` });
  const allowedOrigins = (process.env.CONTACT_ALLOWED_ORIGINS ?? "").split(",").map((value) => value.trim()).filter(Boolean);
  const origin = request.headers.get("origin");
  if (!origin || !allowedOrigins.includes(origin)) return json(403, { code: "origin", message: "Nu am putut verifica sursa solicitării. Reîncarcă pagina și încearcă din nou." });
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") return json(415, { code: "content_type", message: "Formatul solicitării nu este acceptat." });
  const rawLength = request.headers.get("content-length");
  if (rawLength && /^\d+$/.test(rawLength) && Number(rawLength) > MAX_BODY_BYTES) return json(413, { code: "too_large", message: "Mesajul este prea mare. Scurtează-l și încearcă din nou." });
  const body = await readBody(request).catch(() => "");
  if (body === null) return json(413, { code: "too_large", message: "Mesajul este prea mare. Scurtează-l și încearcă din nou." });
  let raw: unknown;
  try { raw = JSON.parse(body); } catch { return json(400, { code: "invalid", message: "Verifică informațiile completate și încearcă din nou." }); }
  const parsed = envelopeSchema.safeParse(raw);
  if (!parsed.success) return json(400, { code: "invalid", message: "Verifică informațiile completate și încearcă din nou." });
  const { requestId, website, turnstileToken, ...fields } = parsed.data;
  if (website.trim()) return json(400, { code: "invalid", message: "Verifică informațiile completate și încearcă din nou." });
  const form = contactSchema.safeParse(fields);
  if (!form.success) return json(400, { code: "invalid", message: "Verifică informațiile completate și încearcă din nou." });
  const verification = await verifyTurnstile(turnstileToken);
  if (!verification.ok) return verification.reason === "unavailable"
    ? json(503, { code: "unavailable", message: `Nu am putut verifica protecția anti-spam. Încearcă din nou sau scrie-ne la ${siteConfig.publicEmail}.` })
    : json(403, { code: "verification", message: "Verificarea anti-spam a expirat. Încearcă din nou." });

  const email = await sendContactEmail(form.data, requestId);
  if (!email.ok) return json(503, { code: "unavailable", message: `Nu am putut trimite mesajul. Încearcă din nou sau scrie-ne la ${siteConfig.publicEmail}.` });
  if (process.env.CONTACT_REGISTRY_ENABLED?.trim() === "true" && process.env.CONTACT_REGISTRY_VERIFIED?.trim() === "true") {
    const registry = await sendContactToRegistry(form.data, requestId, email.providerId);
    if (registry !== "ok") return json(503, { code: "registry", message: `Mesajul a fost trimis, însă nu am putut înregistra solicitarea. Te rugăm să ne scrii la ${siteConfig.publicEmail} și să menționezi codul ${requestId.slice(0, 8)}.` });
  }
  return json(200, { ok: true, message: "Am primit mesajul tău. Îți vom răspunde pe email." });
}
