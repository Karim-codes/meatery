import { defineConfig } from "vite";

// Experiment files remain on disk when switching branches. Never serve them
// through the public website's development server.
export default defineConfig({
  server: {
    fs: {
      deny: [
        ".env",
        ".env.*",
        ".dev.vars*",
        "*.{crt,pem,key,p12,pfx}",
        "**/.git/**",
        "**/.wrangler/**",
        "**/.sandbox/**",
        "**/sandbox/**",
        "**/dist-lab/**",
      ],
    },
  },
});
