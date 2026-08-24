import { defineConfig } from "vite";

// Carbon 1.114 ships @position-try rules that Lightning CSS 1.32 cannot minify.
// The browser accepts the source CSS; disabling only CSS minification preserves it.
export default defineConfig({ build: { cssMinify: false } });
