import { spawn, execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { loadEnv } from "vite";
import { readLabConfig } from "../sandbox/moyasar/config.mjs";

// A second guard in addition to the code/build gates: never start on main.
const git = "/Applications/Xcode.app/Contents/Developer/usr/bin/git";
let branch;
try {
  branch = execFileSync(
    process.platform === "darwin" && existsSync(git) ? git : "git",
    ["branch", "--show-current"],
    { encoding: "utf8" },
  ).trim();
} catch {
  throw new Error(
    "Could not confirm the experiment branch. No lab processes were started.",
  );
}
if (branch !== "experiment/moyasar-payments")
  throw new Error(
    "Switch to experiment/moyasar-payments before starting the lab.",
  );
const env = { ...loadEnv("moyasar-lab", process.cwd(), ""), ...process.env };
readLabConfig(env);
const children = [
  spawn(process.execPath, ["sandbox/moyasar/server.mjs"], {
    env,
    stdio: "inherit",
  }),
  spawn(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "--mode", "moyasar-lab"],
    { env, stdio: "inherit" },
  ),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill("SIGTERM");
  process.exitCode = code;
}
for (const child of children) {
  child.on("error", () => stop(1));
  child.on("exit", (code) => stop(code || 0));
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
