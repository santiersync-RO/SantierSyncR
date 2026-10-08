import { validatePreviewUrl } from "@sanity/preview-url-secret";
import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getPreviewClient } from "@/lib/sanity.server";

export const dynamic = "force-dynamic";

function noStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

function safeLocalRedirect(candidate: unknown, requestUrl: string): string {
  if (typeof candidate !== "string" || !candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) return "/";
  try {
    const url = new URL(candidate, requestUrl);
    return url.origin === new URL(requestUrl).origin ? `${url.pathname}${url.search}${url.hash}` : "/";
  } catch {
    return "/";
  }
}

export async function GET(request: NextRequest) {
  const client = getPreviewClient();
  if (!client) return noStore(NextResponse.json({ error: "Preview is not configured." }, { status: 503 }));

  let redirectTo: unknown;
  try {
    const validation = await validatePreviewUrl(client, request.url);
    if (!validation.isValid) return noStore(NextResponse.json({ error: "Invalid preview URL." }, { status: 401 }));
    redirectTo = validation.redirectTo;
  } catch {
    return noStore(NextResponse.json({ error: "Invalid preview URL." }, { status: 401 }));
  }

  const draft = await draftMode();
  draft.enable();
  return noStore(NextResponse.redirect(new URL(safeLocalRedirect(redirectTo, request.url), request.url)));
}
