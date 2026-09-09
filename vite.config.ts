import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sites } from "@openai/sites-vite-plugin";

export default defineConfig({
  plugins: [react(), sites()],
  server: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
    allowedHosts: ["terminal.local"],
  },
  build: { target: "es2022", sourcemap: false, chunkSizeWarningLimit: 1100 },
});
