import { defineConfig } from "vite";

// Defaults. The `build.cssMinify: false` escape hatch here existed only because
// Carbon 1.114 shipped @position-try rules Lightning CSS could not minify;
// Carbon was deleted from Shine on 2026-08-31 and the workaround went with it.
export default defineConfig({});
