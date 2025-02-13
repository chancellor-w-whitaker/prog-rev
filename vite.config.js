import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { globalConst } from "vite-plugin-global-const";

const outDir = "Y:/Reports/ProgramReview";

const wrapperUrl = "https://irserver2.eku.edu/libraries/remote/wrapper.cjs";

const build = { copyPublicDir: false, emptyOutDir: false, outDir };

// https://vitejs.dev/config/
export default defineConfig({
  build,
  plugins: [
    react(),
    globalConst({
      wrapperUrl,
    }),
  ],
  base: "",
});
