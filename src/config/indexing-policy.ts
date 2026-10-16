export const CANONICAL_SITE_URL = "https://santiersync.ro";

export function isPublicIndexingEnabled(env: Record<string, string | undefined>): boolean {
  return env.PUBLIC_INDEXING_ENABLED?.trim().toLowerCase() === "true" &&
    env.VERCEL_ENV === "production" &&
    env.SITE_URL?.trim() === CANONICAL_SITE_URL;
}
