import "server-only";
import { createHash } from "node:crypto";
import type { ContactInput } from "@/lib/contact-schema";

export type EmailResult = { ok: true; providerId: string } | { ok: false; reason: "configuration" | "provider" };

export async function sendContactEmail(input: ContactInput, requestId: string): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();
  if (!apiKey || !to || !from) return { ok: false, reason: "configuration" };

  const idempotencyKey = createHash("sha256").update(`contact:${requestId}`).digest("hex");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: input.email,
        subject: "Mesaj nou de pe website — ȘantierSync",
        text: [`Nume: ${input.name}`, `E-mail: ${input.email}`, `Firmă: ${input.company || "Nespecificată"}`, "", "Mesaj:", input.message, "", `ID solicitare: ${requestId}`].join("\n"),
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) return { ok: false, reason: "provider" };
    const result: unknown = await response.json().catch(() => null);
    const providerId = typeof result === "object" && result !== null && "id" in result && typeof result.id === "string"
      ? result.id.trim() : "";
    return providerId ? { ok: true, providerId } : { ok: false, reason: "provider" };
  } catch {
    return { ok: false, reason: "provider" };
  } finally {
    clearTimeout(timeout);
  }
}
