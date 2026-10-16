"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./AnalyticsCmp.module.css";

type CMPData = { vendorConsents?: Record<string, unknown> };
type CMP = (
  command: string,
  parameter?: unknown,
  callback?: ((value: unknown) => void) | null,
  async?: boolean,
) => unknown;

declare global {
  interface Window {
    __cmp?: CMP;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: IArguments[];
    [key: `ga-disable-${string}`]: boolean | undefined;
    __santierSyncGaInitialized?: string;
  }
}

function getCMP(): CMP | null {
  return typeof window.__cmp === "function" ? window.__cmp : null;
}

function hasAnalyticsConsent(): boolean | null {
  const cmp = getCMP();
  if (!cmp) return null;
  try {
    const result = cmp("getCMPData") as CMPData | null;
    if (!result || typeof result !== "object" || !result.vendorConsents) return null;
    const status = cmp("consentStatus") as { consentExists?: unknown } | null;
    if (!status || typeof status.consentExists !== "boolean") return null;
    return status.consentExists === true && result.vendorConsents.s26 === true;
  } catch {
    return null;
  }
}

function hasSavedChoice(): boolean {
  const cmp = getCMP();
  if (!cmp) return false;
  try {
    const status = cmp("consentStatus") as { consentExists?: unknown } | null;
    return status?.consentExists === true;
  } catch {
    return false;
  }
}

function pageLocation(path: string): string {
  const safe = new URL(window.location.origin);
  const pathnameOnly = path.split(/[?#]/, 1)[0] || "/";
  safe.pathname = pathnameOnly.startsWith("/") ? pathnameOnly : `/${pathnameOnly}`;
  safe.username = "";
  safe.password = "";
  safe.search = "";
  safe.hash = "";
  return `${safe.origin}${safe.pathname}`;
}

function pageReferrer(previousPath: string | null): string {
  if (previousPath) return pageLocation(previousPath);
  try {
    const safe = new URL(document.referrer);
    return `${safe.origin}${safe.pathname}`;
  } catch {
    return "";
  }
}

function removeAnalyticsCookies() {
  const names = document.cookie.split(";").map((part) => part.split("=")[0]?.trim() ?? "");
  for (const name of names) {
    if (name === "_ga" || name.startsWith("_ga_")) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${window.location.hostname}; SameSite=Lax`;
    }
  }
}

export default function AnalyticsCmp({
  enabled,
  analyticsEnabled,
  localTestingAllowed,
  measurementId,
}: {
  enabled: boolean;
  analyticsEnabled: boolean;
  localTestingAllowed: boolean;
  measurementId: string;
}) {
  const pathname = usePathname() || "/";
  const [hydrated, setHydrated] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [retry, setRetry] = useState(0);
  const consentRef = useRef(false);
  const currentPath = useRef(pathname);
  const lastPageView = useRef<string | null>(null);
  const listenersReady = useRef(false);
  const scriptPending = useRef(false);
  const scriptLoaded = useRef(false);
  const started = useRef(false);
  const mounted = useRef(false);
  const reloadQueued = useRef(false);
  currentPath.current = pathname;

  const allowedHost =
    typeof window !== "undefined" &&
    (window.location.origin === "https://santiersync.ro" ||
      (localTestingAllowed &&
        window.location.hostname !== "" &&
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")));

  const syncCMPState = useCallback(
    (eventName?: string) => {
      const granted = hasAnalyticsConsent();
      const wasGranted = consentRef.current;
      const nextGranted =
        enabled && analyticsEnabled && allowedHost && listenersReady.current && granted === true;
      consentRef.current = nextGranted;
      setAnalyticsConsent(nextGranted);
      window[`ga-disable-${measurementId}`] = !nextGranted;
      if (
        !nextGranted &&
        (wasGranted || started.current || (granted === false && hasSavedChoice()))
      ) {
        removeAnalyticsCookies();
      }

      if (
        wasGranted &&
        !nextGranted &&
        started.current &&
        (eventName === "consent" || eventName === "consentrejected") &&
        hasSavedChoice() &&
        !reloadQueued.current
      ) {
        reloadQueued.current = true;
        window.setTimeout(() => window.location.reload(), 0);
      }
      return granted !== null;
    },
    [allowedHost, analyticsEnabled, enabled, measurementId],
  );

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!enabled || !allowedHost || !analyticsEnabled) {
      listenersReady.current = false;
      const wasActive = consentRef.current || started.current;
      consentRef.current = false;
      if (wasActive) {
        window[`ga-disable-${measurementId}`] = true;
        removeAnalyticsCookies();
      }
      return;
    }

    let attempts = 0;
    let interval: number | undefined;
    let pollingComplete = false;
    const eventNames = ["settings", "consent", "consentrejected"] as const;
    const handlers = new Map<string, (value: unknown) => void>();
    const registered = new Set<string>();

    const registerListeners = () => {
      const cmp = getCMP();
      if (!cmp) return false;
      for (const eventName of eventNames) {
        if (registered.has(eventName)) continue;
        const handler = () => syncCMPState(eventName);
        handlers.set(eventName, handler);
        try {
          cmp("addEventListener", [eventName, handler, false], null);
          registered.add(eventName);
        } catch {
          // Keep waiting for a usable CMP response; unknown consent remains denied.
        }
      }
      listenersReady.current = registered.size === eventNames.length;
      return listenersReady.current;
    };

    const poll = () => {
      attempts += 1;
      const listenersReady = registerListeners();
      const stateReadable = syncCMPState();
      if (listenersReady && stateReadable) {
        pollingComplete = true;
        if (interval !== undefined) window.clearInterval(interval);
        interval = undefined;
        return;
      }
      if (attempts >= 80 && interval !== undefined) {
        pollingComplete = true;
        window.clearInterval(interval);
        interval = undefined;
      }
    };

    poll();
    if (!pollingComplete) {
      interval = window.setInterval(poll, 250);
    }
    mounted.current = true;

    return () => {
      if (interval !== undefined) window.clearInterval(interval);
      const cmp = getCMP();
      for (const [eventName, handler] of handlers) {
        if (!registered.has(eventName)) continue;
        try {
          cmp?.("removeEventListener", [eventName, handler, false], null);
        } catch {
          // Listener removal is best effort; CMP consent remains the source of truth.
        }
      }
      listenersReady.current = false;
      mounted.current = false;
    };
  }, [allowedHost, analyticsEnabled, enabled, measurementId, syncCMPState]);

  const trackCurrentPath = useCallback(
    (path: string) => {
      const currentConsent = hasAnalyticsConsent();
      if (currentConsent !== true || !consentRef.current || !listenersReady.current) {
        consentRef.current = false;
        setAnalyticsConsent(false);
        window[`ga-disable-${measurementId}`] = true;
        if (started.current) removeAnalyticsCookies();
        return;
      }
      if (!scriptLoaded.current || lastPageView.current === path) return;
      const gtag = window.gtag;
      if (!gtag) return;

      window[`ga-disable-${measurementId}`] = false;
      if (window.__santierSyncGaInitialized !== measurementId) {
        gtag("js", new Date());
        window.__santierSyncGaInitialized = measurementId;
      }
      gtag("config", measurementId, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: pageLocation(path),
        page_referrer: pageReferrer(lastPageView.current),
      });
      gtag("event", "page_view", {
        page_location: pageLocation(path),
        page_referrer: pageReferrer(lastPageView.current),
        page_title: document.title,
      });
      lastPageView.current = path;
    },
    [measurementId],
  );

  useEffect(() => {
    if (!enabled || !allowedHost || !analyticsConsent || !consentRef.current || !listenersReady.current) return;
    if (hasAnalyticsConsent() !== true) {
      consentRef.current = false;
      setAnalyticsConsent(false);
      window[`ga-disable-${measurementId}`] = true;
      if (started.current) removeAnalyticsCookies();
      return;
    }
    if (scriptLoaded.current) {
      trackCurrentPath(currentPath.current);
      return;
    }
    if (scriptPending.current) return;

    window.dataLayer = window.dataLayer ?? [];
    window.gtag = window.gtag ?? function gtag() {
      window.dataLayer?.push(arguments);
    };

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    scriptPending.current = true;
    started.current = true;
    script.onload = () => {
      scriptPending.current = false;
      scriptLoaded.current = true;
      if (
        mounted.current &&
        enabled &&
        analyticsEnabled &&
        allowedHost &&
        listenersReady.current &&
        consentRef.current &&
        hasAnalyticsConsent() === true
      ) {
        trackCurrentPath(currentPath.current);
      } else {
        consentRef.current = false;
        setAnalyticsConsent(false);
        window[`ga-disable-${measurementId}`] = true;
        removeAnalyticsCookies();
      }
    };
    script.onerror = () => {
      scriptPending.current = false;
      script.remove();
    };
    if (!listenersReady.current || !consentRef.current || hasAnalyticsConsent() !== true) {
      scriptPending.current = false;
      consentRef.current = false;
      setAnalyticsConsent(false);
      window[`ga-disable-${measurementId}`] = true;
      if (started.current) removeAnalyticsCookies();
      return;
    }
    document.head.appendChild(script);
  }, [allowedHost, analyticsConsent, analyticsEnabled, enabled, measurementId, pathname, retry, trackCurrentPath]);

  const openPreferences = useCallback(() => {
    getCMP()?.("showScreenAdvanced");
    setRetry((value) => value + 1);
  }, []);

  if (!hydrated || !enabled || !allowedHost) return null;

  return (
    <aside className={styles.root} aria-label="Preferințe pentru cookies">
      <button type="button" className={styles.preferences} onClick={openPreferences} aria-haspopup="dialog">
        Preferințe cookies
      </button>
    </aside>
  );
}
