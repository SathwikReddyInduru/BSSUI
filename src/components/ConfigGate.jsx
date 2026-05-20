import { useEffect, useState } from "react";

import { loadConfig } from "../services/configService";
import axiosService from "@/services/AxiosService.js";

function ConfigGate({ children }) {
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    loadConfig()
      .then((apiConfig) => {
        if (!isMounted) return;
        const { http_or_https, server, port } = apiConfig.api;
        axiosService.defaults.baseURL =                        // ← set baseURL
            `${http_or_https}://${server}:${port.port_1}`;

        setStatus("ready");
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(error?.message || "Config file could not be loaded");
        setStatus("failed");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (status === "ready") return children;

  if (status === "failed") {
    return (
      <main style={styles.page}>
        <section style={styles.panel}>
          <h1 style={styles.title}>Application configuration unavailable</h1>
          <p style={styles.message}>
            The application cannot start because config/config.json was not loaded.
          </p>
          <p style={styles.detail}>{errorMessage}</p>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.panel}>
        <h1 style={styles.title}>Loading configuration</h1>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background: "#f3f4f6",
    fontFamily: "Arial, sans-serif",
  },
  panel: {
    width: "min(520px, 100%)",
    padding: 24,
    border: "1px solid #d1d5db",
    borderRadius: 6,
    background: "#ffffff",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
  },
  title: {
    margin: 0,
    color: "#111827",
    fontSize: 20,
    fontWeight: 700,
  },
  message: {
    margin: "12px 0 0",
    color: "#374151",
    fontSize: 14,
    lineHeight: 1.5,
  },
  detail: {
    margin: "12px 0 0",
    color: "#991b1b",
    fontSize: 13,
    lineHeight: 1.5,
  },
};

export default ConfigGate;
