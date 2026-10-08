import "server-only";

type SiteverifyResponse = {
  success?: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
};

export type TurnstileResult = { ok: true } | { ok: false; reason: "invalid" | "unavailable" };

const allowedHostnames = () =>
  (process.env.TURNSTILE_ALLOWED_HOSTNAMES ?? "")
    .split(",")
    .map((hostname) => hostname.trim().toLowerCase())
    .filter(Boolean);

export async function verifyTurnstile(token: string): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const hostnames = allowedHostnames();
  if (!secret || hostnames.length === 0) return { ok: false, reason: "unavailable" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const body = new URLSearchParams({ secret, response: token });
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) return { ok: false, reason: "unavailable" };
    const result = (await response.json()) as SiteverifyResponse;
    if (
      result.success === true &&
      result.action === "contact" &&
      typeof result.hostname === "string" &&
      hostnames.includes(result.hostname.toLowerCase())
    ) {
      return { ok: true };
    }
    return { ok: false, reason: "invalid" };
  } catch {
    return { ok: false, reason: "unavailable" };
  } finally {
    clearTimeout(timeout);
  }
}
