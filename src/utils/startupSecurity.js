const PERSIST_ROOT_KEY = "persist:root";

const getLoginPath = () => {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${basePath}/login`;
};

export const enforceLoginOnStartup = () => {
  try {
    window.sessionStorage.removeItem(PERSIST_ROOT_KEY);
    window.localStorage.removeItem(PERSIST_ROOT_KEY);
  } catch {
    // Storage can be unavailable in restricted browser modes.
  }

  const loginPath = getLoginPath();

  if (window.location.pathname !== loginPath) {
    window.history.replaceState(null, "", `${loginPath}${window.location.search}`);
  }
};
