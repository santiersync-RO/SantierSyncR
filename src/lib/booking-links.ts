/** Never forward page/form query parameters into the third-party calendar. */
export function calendarLinks(eventUrl: string): { direct: string; embed: string } | null {
  try {
    const url = new URL(eventUrl);
    if (url.origin !== "https://cal.com" || url.username || url.password || url.search || url.hash ||
      !/^\/santiersyncro\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname)) return null;
    // The event's interface language is configured in Cal.com (Română).
    // The visitor keeps control of their timezone and 12h/24h preference.
    const direct = url.toString();
    url.searchParams.set("embed", "true");
    return { direct, embed: url.toString() };
  } catch { return null; }
}
