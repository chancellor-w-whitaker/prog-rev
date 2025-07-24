import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { patch } from "./src/utilities/patch";

// review year after review type

// review complete & final recommendation at the end

// const outDir = "Y:/Reports/NewProgramReviewBethany";

export default defineConfig(patch({ plugins: [react()] }));
