import { mkdirSync, chmodSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnv } from "vite";
import { readLabConfig } from "./config.mjs";
import { openLabStore } from "./store.mjs";
import { createGateway } from "./service.mjs";
import { createLabServer } from "./app.mjs";

const env = { ...loadEnv("moyasar-lab", process.cwd(), ""), ...process.env };
const config = readLabConfig(env);
const directory = resolve(".sandbox");
mkdirSync(directory, { recursive: true, mode: 0o700 });
chmodSync(directory, 0o700);
const databasePath = resolve(directory, "moyasar-lab.sqlite");
const store = openLabStore(databasePath);
chmodSync(databasePath, 0o600);
const gateway = config.ready
  ? createGateway(config.secretKey)
  : async () => {
      throw new Error("Sandbox keys missing.");
    };
const { server } = createLabServer({ config, store, gateway });
server.listen(config.port, "127.0.0.1", () => {
  console.log(
    `Moyasar SANDBOX API listening locally on port ${config.port}. ${config.ready ? "Test keys configured." : "Test keys required; checkout is disabled."}`,
  );
});
server.on("error", () => {
  console.error(
    "The sandbox API could not bind its local port. Check for another running lab.",
  );
  process.exitCode = 1;
});
function stop() {
  server.close(() => {
    store.close();
    process.exit(0);
  });
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
