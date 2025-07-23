import { globalConst } from "vite-plugin-global-const";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// review year after review type

// review complete & final recommendation at the end

const outDir = "Y:/Reports/NewProgramReviewBethany";

const wrapperUrl = "https://irserver2.eku.edu/libraries/remote/wrapper.cjs";

const build = {
  copyPublicDir: false,
  emptyOutDir: false,
  minify: false,
  outDir,
};

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
