const DEV_LOG_ENDPOINT = "/__dev_log__";
const REDACTED = "***********";
const SENSITIVE_KEYS = [
  "authorization",
  "cookie",
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "apiKey",
];

const isSensitiveKey = (key) =>
  SENSITIVE_KEYS.some((sensitiveKey) => key.toLowerCase().includes(sensitiveKey.toLowerCase()));

const redactValue = (value) => {
  if (Array.isArray(value)) return value.map(redactValue);

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        isSensitiveKey(key) ? REDACTED : redactValue(nestedValue),
      ]),
    );
  }

  return value;
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

export const logBackendApiCall = ({ method, url, request, response, error, durationMs, outcome }) => {
  if (!import.meta.env.DEV || typeof window === "undefined") return Promise.resolve();

  const event = {
    eventType: "backendApiCallsTracker",
    pageName: window.location.pathname,
    target: `${method} ${url}`,
    userName: getUserName(),
    details: {
      target: `${method} ${url}`,
      request: redactValue({
        method,
        url,
        ...request,
      }),
      response: response ? redactValue(response) : undefined,
      error,
      durationMs,
      outcome,
    },
  };

  return fetch(DEV_LOG_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ events: [event] }),
  }).catch(() => {
    // Dev logging must never affect application behavior.
  });
};
