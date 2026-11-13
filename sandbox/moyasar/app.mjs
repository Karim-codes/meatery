import { createServer } from "node:http";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { createLabService, LabError, UUID } from "./service.mjs";
import { FIXTURE_ITEMS } from "./store.mjs";

const PREFIX = "/lab-api/moyasar";
const COOKIE = "meatery_lab_session";
export const hash = (value) => createHash("sha256").update(value).digest("hex");
const equal = (a, b) =>
  timingSafeEqual(Buffer.from(hash(a)), Buffer.from(hash(b)));

export function createLabServer({ config, store, gateway }) {
  const service = createLabService(store, config, gateway);
  const limits = new Map();
  let reconciling = false;
  const server = createServer(async (request, response) => {
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "no-referrer");
    try {
      // The API only speaks JSON and never accepts payment-source/card fields.
      const url = new URL(request.url, config.origin);
      if (!url.pathname.startsWith(`${PREFIX}/`))
        throw new LabError(404, "Lab endpoint not found.");
      if (!["GET", "POST", "PATCH"].includes(request.method))
        throw new LabError(405, "Method not allowed.");
      if (request.headers.origin && request.headers.origin !== config.origin)
        throw new LabError(403, "Unrecognised lab origin.");
      if (request.method !== "GET" && request.headers.origin !== config.origin)
        throw new LabError(403, "A same-origin request is required.");
      if (request.headers["sec-fetch-site"] === "cross-site")
        throw new LabError(403, "Cross-site requests are not allowed.");
      const key = request.socket.remoteAddress || "local";
      const now = Date.now();
      const limit = limits.get(key);
      if (!limit || limit.until <= now)
        limits.set(key, { count: 1, until: now + 60000 });
      else if (++limit.count > 120)
        throw new LabError(
          429,
          "Too many lab requests. Wait a minute and try again.",
        );
      if (limits.size > 1000)
        for (const [id, value] of limits)
          if (value.until < now) limits.delete(id);

      let body = {};
      if (request.method !== "GET") {
        if (
          !(request.headers["content-type"] || "").startsWith(
            "application/json",
          )
        )
          throw new LabError(415, "JSON is required.");
        let bytes = 0,
          raw = "";
        for await (const chunk of request) {
          bytes += chunk.length;
          if (bytes > 2048) throw new LabError(413, "Request is too large.");
          raw += chunk.toString();
        }
        try {
          body = raw ? JSON.parse(raw) : {};
        } catch {
          throw new LabError(400, "Invalid JSON.");
        }
        if (!body || Array.isArray(body) || typeof body !== "object")
          throw new LabError(400, "Invalid request.");
      }
      const allow = (keys) => {
        if (Object.keys(body).some((k) => !keys.includes(k)))
          throw new LabError(
            400,
            "Unexpected fields. Never send card data to the lab API.",
          );
      };
      const cookieValue = (request.headers.cookie || "")
        .split(";")
        .map((v) => v.trim())
        .find((v) => v.startsWith(`${COOKIE}=`))
        ?.slice(COOKIE.length + 1);
      const session = /^[a-f0-9]{64}$/.test(cookieValue || "")
        ? cookieValue
        : "";
      const path = url.pathname.slice(PREFIX.length);
      let result;
      let status = 200;

      if (path === "/config" && request.method === "GET") {
        result = {
          sandbox: true,
          ready: config.ready,
          kitchenConfigured: Boolean(config.kitchenKey),
          items: FIXTURE_ITEMS,
          amount: 5000,
          currency: "SAR",
          appleEnabled: config.appleEnabled,
          appleAmount: config.appleAmount,
        };
      } else if (path === "/orders" && request.method === "POST") {
        allow(["method"]);
        const guest = session || randomBytes(32).toString("hex");
        result = service.create(hash(guest), body.method || "creditcard");
        response.setHeader(
          "Set-Cookie",
          `${COOKIE}=${guest}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800${config.origin.startsWith("https:") ? "; Secure" : ""}`,
        );
        result = service.checkout(result.id, hash(guest));
        status = 201;
      } else if (/^\/orders\/[^/]+(?:\/(?:intent|verify))?$/.test(path)) {
        const [, , id, action] = path.split("/");
        if (!session)
          throw new LabError(
            401,
            "This test order needs its original browser session.",
          );
        if (action === "intent" && request.method === "POST") {
          allow([]);
          result = await service.intent(id, hash(session));
        } else if (action === "verify" && request.method === "POST") {
          allow(["paymentId"]);
          if (body.paymentId != null && typeof body.paymentId !== "string")
            throw new LabError(400, "Invalid payment ID.");
          result = await service.verify(id, hash(session), body.paymentId);
        } else if (!action && request.method === "GET")
          result = service.checkout(id, hash(session));
        else throw new LabError(405, "Method not allowed.");
      } else if (path.startsWith("/kitchen")) {
        const credential = (request.headers.authorization || "").replace(
          /^Bearer /,
          "",
        );
        if (
          !config.kitchenKey ||
          !credential ||
          !equal(credential, config.kitchenKey)
        )
          throw new LabError(401, "Enter the sandbox kitchen access key.");
        if (path === "/kitchen" && request.method === "GET")
          result = {
            orders: store.listKitchen(),
            updatedAt: new Date().toISOString(),
          };
        else if (
          /^\/kitchen\/[^/]+$/.test(path) &&
          request.method === "PATCH"
        ) {
          allow(["from", "to"]);
          const id = path.split("/")[2];
          if (!UUID.test(id) || !store.transition(id, body.from, body.to))
            throw new LabError(
              409,
              "This order changed or that status transition is not permitted. Refresh the kitchen.",
            );
          result = {
            orders: store.listKitchen(),
            updatedAt: new Date().toISOString(),
          };
        } else throw new LabError(404, "Kitchen endpoint not found.");
      } else throw new LabError(404, "Lab endpoint not found.");
      response.writeHead(status);
      response.end(JSON.stringify(result));
    } catch (error) {
      // No gateway response bodies, keys, card details or cookies enter logs.
      const known = error instanceof LabError;
      response.writeHead(known ? error.status : 500);
      response.end(
        JSON.stringify({
          error: known
            ? error.message
            : "The sandbox could not complete this request. No successful payment has been confirmed.",
        }),
      );
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  const timer = setInterval(async () => {
    if (reconciling || !config.ready) return;
    reconciling = true;
    try {
      await service.reconcile();
    } finally {
      reconciling = false;
    }
  }, 15000);
  timer.unref();
  server.on("close", () => clearInterval(timer));
  return { server, service };
}
