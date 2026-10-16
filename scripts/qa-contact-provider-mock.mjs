import { createHash } from "node:crypto";

if (process.env.QA_CONTACT_MOCK !== "true" || process.env.NODE_ENV === "production") {
  throw new Error("QA contact provider mock requires QA_CONTACT_MOCK=true in a non-production process.");
}

const originalFetch = globalThis.fetch.bind(globalThis);
const resendIds = new Map();

function requestUrl(input) {
  try {
    return new URL(input instanceof Request ? input.url : input);
  } catch {
    return null;
  }
}

async function bodyText(input, init) {
  const body = init?.body;
  if (typeof body === "string") return body;
  if (body instanceof URLSearchParams) return body.toString();
  if (input instanceof Request) return input.clone().text();
  return "";
}

function json(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

function mockHostname() {
  const allowed = (process.env.TURNSTILE_ALLOWED_HOSTNAMES ?? "")
    .split(",")
    .map((hostname) => hostname.trim().toLowerCase())
    .filter(Boolean);
  const hostname = ["localhost", "127.0.0.1"].find((candidate) => allowed.includes(candidate));
  if (!hostname) throw new Error("QA contact mock requires localhost or 127.0.0.1 in TURNSTILE_ALLOWED_HOSTNAMES.");
  return hostname;
}

globalThis.fetch = async function qaContactMockFetch(input, init) {
  const url = requestUrl(input);
  if (!url || url.protocol !== "https:") return originalFetch(input, init);

  if (url.hostname === "api.resend.com" && url.pathname === "/emails" && url.search === "") {
    const text = await bodyText(input, init);
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      return json({ message: "Invalid JSON" }, 400);
    }
    if (typeof payload?.text === "string" && payload.text.includes("QA_PROVIDER_ERROR")) {
      return json({ message: "QA provider failure" }, 503);
    }
    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
    const idempotencyKey = headers.get("Idempotency-Key") || createHash("sha256").update(text).digest("hex");
    let id = resendIds.get(idempotencyKey);
    if (!id) {
      id = `qa_email_${createHash("sha256").update(idempotencyKey).digest("hex").slice(0, 24)}`;
      resendIds.set(idempotencyKey, id);
    }
    return json({ id });
  }

  if (url.hostname === "challenges.cloudflare.com" &&
      url.pathname === "/turnstile/v0/siteverify" && url.search === "") {
    const text = await bodyText(input, init);
    const params = new URLSearchParams(text);
    return json({
      success: Boolean(params.get("response")),
      hostname: mockHostname(),
      action: "contact",
    });
  }

  return originalFetch(input, init);
};
