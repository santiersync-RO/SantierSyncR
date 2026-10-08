import "server-only";
import type { ContactInput } from "@/lib/contact-schema";

export type EmailResult = { ok: true } | { ok: false; reason: "configuration" | "provider" };

export async function sendContactEmail(input: ContactInput, requestId: string): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) return { ok: false, reason: "configuration" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `contact/${requestId}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: input.email,
        subject: "Solicitare nouă de pe website — ȘantierSync",
        text: [
          "Solicitare nouă de pe website — ȘantierSync",
          "",
          `Firmă: ${input.company}`,
          `Nume: ${input.name || "Nespecificat"}`,
          `Email: ${input.email}`,
          `Telefon: ${input.phone || "Nespecificat"}`,
          "",
          "Mesaj:",
          input.message,
          "",
          `ID solicitare: ${requestId}`,
        ].join("\n"),
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) return { ok: false, reason: "provider" };
    const result: unknown = await response.json();
    return typeof result === "object" && result !== null && "id" in result && typeof result.id === "string"
      ? { ok: true }
      : { ok: false, reason: "provider" };
  } catch {
    return { ok: false, reason: "provider" };
  } finally {
    clearTimeout(timeout);
  }
}
