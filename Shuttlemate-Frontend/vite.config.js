import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on 0.0.0.0 so Docker (ZAP) can reach the dev server
    allowedHosts: ["host.docker.internal"], // Allow ZAP Docker container access
  },
});
