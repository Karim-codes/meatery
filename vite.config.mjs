import { defineConfig, loadEnv } from "vite";
import { readLabConfig } from "./sandbox/moyasar/config.mjs";

const privateFiles = [
  ".env",
  ".env.*",
  "*.{crt,pem}",
  "**/.git/**",
  "**/.sandbox/**",
  "**/sandbox/**",
  "**/dist-lab/**",
];

export default defineConfig(({ mode, command }) => {
  if (mode !== "moyasar-lab") return { server: { fs: { deny: privateFiles } } };
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  // A local lab bundle may be built for inspection, but the API still refuses
  // NODE_ENV=production and all Vercel environments.
  const config = readLabConfig({
    ...env,
    NODE_ENV: command === "build" ? "development" : env.NODE_ENV,
  });
  if (env.VITE_MOYASAR_LAB_ENABLED !== "true") {
    throw new Error(
      "Explicitly enable VITE_MOYASAR_LAB_ENABLED for the isolated lab.",
    );
  }
  return {
    server: {
      host: "127.0.0.1",
      port: new URL(config.origin).port
        ? Number(new URL(config.origin).port)
        : 5174,
      strictPort: true,
      fs: {
        deny: privateFiles,
      },
      proxy:
        command === "serve"
          ? {
              "/lab-api/moyasar": { target: `http://127.0.0.1:${config.port}` },
            }
          : undefined,
    },
  };
});
