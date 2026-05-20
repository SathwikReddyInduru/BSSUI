const DEV_LOG_ENDPOINT = "/__dev_log__";
const FLUSH_INTERVAL_MS = 2000;
const MAX_BATCH_SIZE = 20;

let queue = [];
let flushTimer = null;
let initialized = false;

const getCurrentUrl = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;

const getElementTarget = (element) => {
  if (!element) return "";

  const label =
    element.getAttribute("aria-label") ||
    element.getAttribute("title") ||
    element.name ||
    element.id ||
    element.textContent?.trim();

  if (label) return label.replace(/\s+/g, " ").slice(0, 80);

  return element.tagName?.toLowerCase() || "";
};

const getInteractiveTarget = (target) => {
  if (!(target instanceof Element)) return null;

  return target.closest("button, a, [role='button']");
};

const getUserName = () => {
  try {
    const persistedRoot = sessionStorage.getItem("persist:root");
    if (!persistedRoot) return "anonymous";

    const root = JSON.parse(persistedRoot);
    const auth = root.auth ? JSON.parse(root.auth) : null;

    return auth?.user?.userName || auth?.user?.loginName || auth?.user?.name || "anonymous";
  } catch {
    return "anonymous";
  }
};

const sendEvents = (events, useBeacon = false) => {
  if (!events.length) return;

  const body = JSON.stringify({ events });

  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon(DEV_LOG_ENDPOINT, new Blob([body], { type: "application/json" }));
    return;
  }

  window.fetch(DEV_LOG_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Dev logging must never affect the application flow.
  });
};

const flush = (useBeacon = false) => {
  if (!queue.length) return;

  const events = queue;
  queue = [];
  sendEvents(events, useBeacon);
};

const scheduleFlush = () => {
  if (flushTimer) return;

  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    flush();
  }, FLUSH_INTERVAL_MS);
};

const trackEvent = (eventType, details = {}) => {
  queue.push({
    eventType,
    pageName: details.pageName || window.location.pathname,
    target: details.target || "",
    userName: getUserName(),
    details,
  });

  if (details.flushImmediately || queue.length >= MAX_BATCH_SIZE) {
    flush();
  } else {
    scheduleFlush();
  }
};

const trackNavigation = (from, to, navigationType) => {
  if (from === to) return;

  trackEvent("browserRouteNavigationTracker", {
    pageName: from,
    target: to,
    from,
    to,
    navigationType,
  });
};

const initializeNavigationTracking = () => {
  let currentUrl = getCurrentUrl();

  const wrapHistoryMethod = (methodName) => {
    const originalMethod = window.history[methodName];

    window.history[methodName] = function wrappedHistoryMethod(...args) {
      const from = currentUrl;
      const result = originalMethod.apply(this, args);
      const to = getCurrentUrl();

      currentUrl = to;
      trackNavigation(from, to, methodName);

      return result;
    };
  };

  wrapHistoryMethod("pushState");
  wrapHistoryMethod("replaceState");

  window.addEventListener("popstate", () => {
    const from = currentUrl;
    const to = getCurrentUrl();

    currentUrl = to;
    trackNavigation(from, to, "popstate");
  });
};

export const initializeDevEventLogger = () => {
  if (!import.meta.env.DEV || initialized || typeof window === "undefined") return;

  initialized = true;
  trackEvent("app_start", { target: document.title || "BSS UI" });
  initializeNavigationTracking();

  document.addEventListener(
    "click",
    (event) => {
      const target = getInteractiveTarget(event.target);
      if (!target) return;

      trackEvent("btnClickTracker", {
        target: getElementTarget(target),
        tagName: target.tagName?.toLowerCase(),
        type: target.type || "",
      });
    },
    true,
  );

  document.addEventListener(
    "change",
    (event) => {
      const target = event.target instanceof Element ? event.target.closest("input, select, textarea") : null;
      if (!target) return;

      trackEvent("change", {
        target: getElementTarget(target),
        tagName: target.tagName?.toLowerCase(),
        type: target.type || "",
      });
    },
    true,
  );

  document.addEventListener(
    "submit",
    (event) => {
      trackEvent("submit", {
        target: getElementTarget(event.target),
      });
    },
    true,
  );

  window.addEventListener("error", (event) => {
    trackEvent("error", {
      target: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
    });
    flush();
  });

  window.addEventListener("unhandledrejection", (event) => {
    trackEvent("promise_error", {
      target: String(event.reason?.message || event.reason || "Unhandled promise rejection"),
    });
    flush();
  });

  window.addEventListener("beforeunload", () => {
    flush(true);
  });
};
