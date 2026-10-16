import "server-only";
import type { BookingRegistryEvent } from "@/lib/calcom-webhook";
import { signRegistryEnvelope } from "@/lib/calcom-webhook";

const SCRIPT_ENDPOINT = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
const RESPONSE_HOST = "script.googleusercontent.com";

export type RegistryResult = "ok" | "unavailable" | "failed";

export async function sendBookingToRegistry(event: BookingRegistryEvent): Promise<RegistryResult> {
  const endpoint = process.env.REGISTRY_ENDPOINT_URL?.trim() ?? "";
  const secret = process.env.REGISTRY_SHARED_SECRET?.trim() ?? "";
  if (!SCRIPT_ENDPOINT.test(endpoint) || secret.length < 32) return "unavailable";

  const issuedAt = new Date().toISOString();
  const data = JSON.stringify(event);
  const signature = signRegistryEnvelope(issuedAt, data, secret);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const initialResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ issuedAt, data, signature }),
      cache: "no-store",
      redirect: "manual",
      signal: controller.signal,
    });
    if (![301, 302, 303].includes(initialResponse.status)) return "failed";
    const location = initialResponse.headers.get("location");
    if (!location) return "failed";
    let redirectUrl: URL;
    try {
      redirectUrl = new URL(location, endpoint);
    } catch {
      return "failed";
    }
    if (redirectUrl.protocol !== "https:" || redirectUrl.hostname !== RESPONSE_HOST ||
        redirectUrl.username || redirectUrl.password || redirectUrl.port) return "failed";
    const response = await fetch(redirectUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      redirect: "manual",
      signal: controller.signal,
    });
    let finalUrl: URL;
    try {
      finalUrl = new URL(response.url);
    } catch {
      return "failed";
    }
    if (finalUrl.hostname !== RESPONSE_HOST || finalUrl.protocol !== "https:" || finalUrl.username ||
        finalUrl.password || finalUrl.port || !response.ok) return "failed";
    const result: unknown = await response.json().catch(() => null);
    return typeof result === "object" && result !== null && (result as { ok?: unknown }).ok === true
      ? "ok"
      : "failed";
  } catch {
    return "failed";
  } finally {
    clearTimeout(timeout);
  }
}
