import { globalConst } from "vite-plugin-global-const";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const outDir = "Y:/Reports/NewProgramReview";

const wrapperUrl = "https://irserver2.eku.edu/libraries/remote/wrapper.cjs";

const build = { copyPublicDir: false, emptyOutDir: false, outDir };

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    globalConst({
      wrapperUrl,
    }),
  ],
  base: "",
  build,
});
