import "server-only";

import { createClient, type SanityClient } from "@sanity/client";
import { draftMode } from "next/headers";
import { cache } from "react";
import { defaultSiteContent, parseSiteContent, type SiteContent } from "@/content/site-content";

const apiVersion = "2026-10-08";
const contentTag = "site-content";

function projectConfig() {
  const projectId = process.env.SANITY_PROJECT_ID?.trim();
  const dataset = process.env.SANITY_DATASET?.trim();
  if (!projectId || !/^[a-z0-9]{8}$/.test(projectId) || !dataset || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(dataset)) return null;
  return { projectId, dataset };
}

function hasAnySanityConfig(): boolean {
  return Boolean(process.env.SANITY_PROJECT_ID?.trim() || process.env.SANITY_DATASET?.trim() || process.env.SANITY_API_READ_TOKEN?.trim());
}

function clientOptions(token?: string) {
  const config = projectConfig();
  if (!config) return null;
  return {
    ...config,
    apiVersion,
    useCdn: false,
    ...(token ? { token } : {}),
  };
}

let publicClient: SanityClient | null | undefined;
export function getPublicSanityClient(): SanityClient | null {
  if (publicClient !== undefined) return publicClient;
  const options = clientOptions();
  try {
    publicClient = options ? createClient({ ...options, perspective: "published" }) : null;
  } catch {
    publicClient = null;
  }
  return publicClient;
}

export function getPreviewClient(): SanityClient | null {
  const token = process.env.SANITY_API_READ_TOKEN?.trim();
  const options = token ? clientOptions(token) : null;
  try {
    return options ? createClient({ ...options, perspective: "drafts", stega: false }) : null;
  } catch {
    return null;
  }
}

const siteContentQuery = `*[_id == "siteContent" && _type == "siteContent"][0]{
  home, footer, contactForm, seo,
  "branding": {
    "logo": {
      "url": branding.logo.asset->url,
      "width": branding.logo.asset->metadata.dimensions.width,
      "height": branding.logo.asset->metadata.dimensions.height,
      "originalCrop": coalesce(branding.logo.originalCrop, false),
      "alt": coalesce(branding.logo.alt, "")
    }
  }
}`;

async function loadPublishedContent(): Promise<SiteContent> {
  const client = getPublicSanityClient();
  if (!client) {
    if (hasAnySanityConfig()) console.error("[sanity] Sanity configuration is incomplete or invalid; using checked-in defaults.");
    return defaultSiteContent;
  }
  try {
    const document = await client.fetch<unknown>(siteContentQuery, {}, {
      next: { revalidate: 60, tags: [contentTag] },
    });
    if (!document) {
      console.error("[sanity] Published site content is missing; using checked-in defaults.");
      return defaultSiteContent;
    }
    const parsed = parseSiteContent(document);
    if (parsed === defaultSiteContent) console.error("[sanity] Published site content failed validation; using checked-in defaults.");
    return parsed;
  } catch {
    console.error("[sanity] Could not load published site content; using checked-in defaults.");
    return defaultSiteContent;
  }
}

export const getSiteContent = cache(loadPublishedContent);

async function loadDraftSiteContent(): Promise<SiteContent> {
  const draft = await draftMode();
  if (!draft.isEnabled || !process.env.SANITY_API_READ_TOKEN?.trim()) return getSiteContent();
  const client = getPreviewClient();
  if (!client) return getSiteContent();
  try {
    const document = await client.fetch<unknown>(siteContentQuery, {}, { cache: "no-store", perspective: "drafts" });
    if (!document) return getSiteContent();
    const parsed = parseSiteContent(document);
    if (parsed === defaultSiteContent) {
      console.error("[sanity] Draft site content failed validation; falling back to published content.");
      return getSiteContent();
    }
    return parsed;
  } catch {
    console.error("[sanity] Could not load draft site content; falling back to published content.");
    return getSiteContent();
  }
}

export const getDraftSiteContent = cache(loadDraftSiteContent);
