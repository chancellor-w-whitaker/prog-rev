import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: { emptyOutDir: true, outDir: "docs" },
  plugins: [react()],
  base: "",
});
