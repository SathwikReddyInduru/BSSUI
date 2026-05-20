import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { devLogPlugin } from "./src/vite-log-plugin.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  base: '/xom/',
  plugins: [
    react(),
    devLogPlugin()
  ],
  server: {
    host: "10.10.19.228",
    port: 9000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "build",
  },
})
