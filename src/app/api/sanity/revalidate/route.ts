import { isValidSignature } from "@sanity/webhook";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const maxBodyBytes = 64 * 1024;

function response(status: number, message?: string) {
  const result = message ? NextResponse.json({ error: message }, { status }) : new NextResponse(null, { status });
  result.headers.set("Cache-Control", "private, no-store, max-age=0");
  return result;
}

async function readBody(request: Request): Promise<string | null> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBodyBytes) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBodyBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { return null; }
}

export async function POST(request: Request) {
  const secret = process.env.SANITY_WEBHOOK_SECRET?.trim();
  if (!secret) return response(503, "Webhook is not configured.");
  const signature = request.headers.get("sanity-webhook-signature");
  if (!signature) return response(401, "Invalid signature.");
  const body = await readBody(request);
  if (body === null) return response(413, "Request body is too large or invalid.");

  try {
    if (!(await isValidSignature(body, signature, secret))) return response(401, "Invalid signature.");
  } catch {
    return response(401, "Invalid signature.");
  }

  let document: unknown;
  try { document = JSON.parse(body); } catch { return response(400, "Invalid payload."); }
  if (!document || typeof document !== "object" || (document as Record<string, unknown>)._id !== "siteContent" || (document as Record<string, unknown>)._type !== "siteContent") {
    return response(400, "Unexpected document.");
  }

  revalidateTag("site-content", { expire: 0 });
  return response(204);
}
