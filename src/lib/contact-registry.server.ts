import "server-only";
import { createHash } from "node:crypto";
import { signRegistryEnvelope } from "@/lib/calcom-webhook";
import type { ContactInput } from "@/lib/contact-schema";

const ENDPOINT = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
const RESPONSE_HOST = "script.googleusercontent.com";
export type ContactRegistryResult = "ok" | "unavailable" | "failed";

export async function sendContactToRegistry(input: ContactInput, requestId: string, providerId: string): Promise<ContactRegistryResult> {
  if (process.env.CONTACT_REGISTRY_ENABLED?.trim() !== "true" || process.env.CONTACT_REGISTRY_VERIFIED?.trim() !== "true") return "unavailable";
  const endpoint = process.env.REGISTRY_ENDPOINT_URL?.trim() ?? "";
  const secret = process.env.REGISTRY_SHARED_SECRET?.trim() ?? "";
  if (!ENDPOINT.test(endpoint) || secret.length < 32) return "unavailable";

  const event = {
    type: "CONTACT_SUBMITTED",
    requestId: createHash("sha256").update(`contact:${requestId}`).digest("hex"),
    providerId: createHash("sha256").update(providerId).digest("hex"),
    createdAt: new Date().toISOString(),
    name: input.name,
    email: input.email,
    company: input.company,
    message: input.message,
  };
  const issuedAt = new Date().toISOString();
  const data = JSON.stringify(event);
  const signature = signRegistryEnvelope(issuedAt, data, secret);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const initial = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ issuedAt, data, signature }), cache: "no-store", redirect: "manual", signal: controller.signal });
    if (![301, 302, 303].includes(initial.status)) return "failed";
    const location = initial.headers.get("location");
    if (!location) return "failed";
    const url = new URL(location, endpoint);
    if (url.protocol !== "https:" || url.hostname !== RESPONSE_HOST || url.username || url.password || url.port) return "failed";
    const response = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store", redirect: "manual", signal: controller.signal });
    const finalUrl = new URL(response.url);
    if (!response.ok || finalUrl.protocol !== "https:" || finalUrl.hostname !== RESPONSE_HOST || finalUrl.username || finalUrl.password || finalUrl.port) return "failed";
    const result: unknown = await response.json().catch(() => null);
    return typeof result === "object" && result !== null && (result as { ok?: unknown }).ok === true ? "ok" : "failed";
  } catch {
    return "failed";
  } finally {
    clearTimeout(timeout);
  }
}
