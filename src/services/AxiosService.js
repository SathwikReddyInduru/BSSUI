import axios from "axios";

import { logBackendApiCall } from "../utils/backendApiLogger";

const axiosService = axios.create({
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
  },
});

const getRequestUrl = (config = {}) => {
  try {
    return new URL(config.url || "", config.baseURL || window.location.origin).toString();
  } catch {
    return String(config.url || "");
  }
};

const shouldLogApiCall = (config = {}) => {
  if (config.skipDevApiLog) return false;
  if (!import.meta.env.DEV) return false;

  const url = getRequestUrl(config);

  try {
    const parsedUrl = new URL(url, window.location.origin);
    return parsedUrl.origin !== window.location.origin || parsedUrl.pathname.includes("/api");
  } catch {
    return url.includes("/api");
  }
};

const getDurationMs = (config = {}) => {
  const startedAt = config.metadata?.startedAt;
  return startedAt ? Math.round(performance.now() - startedAt) : undefined;
};

axiosService.interceptors.request.use((config) => ({
  ...config,
  metadata: {
    ...(config.metadata || {}),
    startedAt: performance.now(),
  },
}));

axiosService.interceptors.response.use(
  async (response) => {
    const { config } = response;

    if (shouldLogApiCall(config)) {
      const method = String(config.method || "GET").toUpperCase();
      const url = getRequestUrl(config);

      await logBackendApiCall({
        method,
        url,
        request: {
          headers: config.headers,
          body: config.data,
        },
        response: {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          body: response.data,
        },
        durationMs: getDurationMs(config),
        outcome: "success",
      });
    }

    return response;
  },
  async (error) => {
    const config = error.config || {};

    if (shouldLogApiCall(config)) {
      const method = String(config.method || "GET").toUpperCase();
      const url = getRequestUrl(config);

      await logBackendApiCall({
        method,
        url,
        request: {
          headers: config.headers,
          body: config.data,
        },
        response: error.response
          ? {
              status: error.response.status,
              statusText: error.response.statusText,
              headers: error.response.headers,
              body: error.response.data,
            }
          : undefined,
        error: error.message || "Backend API error",
        durationMs: getDurationMs(config),
        outcome: "error",
      });
    }

    return Promise.reject(error);
  },
);

export default axiosService;
