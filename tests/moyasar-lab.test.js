import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readLabConfig } from "../sandbox/moyasar/config.mjs";
import { openLabStore } from "../sandbox/moyasar/store.mjs";
import {
  createLabService,
  createGateway,
} from "../sandbox/moyasar/service.mjs";
import { createLabServer, hash } from "../sandbox/moyasar/app.mjs";

// All gateway responses in this test file are injected fixtures, not a claim of
// a completed Moyasar transaction. No test calls the real payment API.
const env = {
  MOYASAR_LAB_ENABLED: "true",
  VITE_MOYASAR_LAB_ENABLED: "true",
  VITE_MOYASAR_PUBLISHABLE_KEY: "pk_test_UNITTESTONLY",
  MOYASAR_SECRET_KEY: "sk_test_UNITTESTONLY",
  MOYASAR_LAB_KITCHEN_KEY: "local-unit-test-kitchen-key-0000000000",
};
const config = readLabConfig(env);
const session = hash("unit-test-session");
function payment(row, overrides = {}) {
  return {
    id: row.payment_id,
    status: "paid",
    amount: row.amount,
    currency: "SAR",
    live: false,
    refunded: 0,
    voided_at: null,
    description: row.description,
    callback_url: row.callback_url,
    metadata: { lab: "meatery-moyasar-v1", order_id: row.id },
    source: { type: row.method, company: "mada" },
    ...overrides,
  };
}
function setup(t, gateway) {
  const store = openLabStore(":memory:");
  t.after(() => store.close());
  const service = createLabService(
    store,
    config,
    gateway || (async () => null),
  );
  const order = service.create(session, "creditcard");
  return { store, service, order, row: store.order(order.id) };
}

test("lab refuses live keys, production hosting, nonlocal HTTP origins and publicly exposed secrets", () => {
  for (const extra of [
    { MOYASAR_SECRET_KEY: "sk_live_REJECT" },
    { VITE_MOYASAR_PUBLISHABLE_KEY: "pk_live_REJECT" },
    { VERCEL: "1" },
    { NODE_ENV: "production" },
    { MOYASAR_LAB_ENABLED: "false" },
    { VITE_MOYASAR_SECRET_KEY: "sk_test_REJECT" },
    { VITE_ACCIDENTAL_VALUE: "sk_test_REJECT" },
    { MOYASAR_LAB_ORIGIN: "http://restaurant.example" },
    { MOYASAR_LAB_ORIGIN: "https://restaurant.example/path" },
  ])
    assert.throws(() => readLabConfig({ ...env, ...extra }));
  assert.equal(readLabConfig({ MOYASAR_LAB_ENABLED: "true" }).ready, false);
});

test("backend owns the 5000-halalas fixture and separate Apple Pay amount", (t) => {
  const { service, order } = setup(t);
  assert.equal(order.amount, 5000);
  assert.equal(
    order.items.reduce((sum, item) => sum + item.amount * item.quantity, 0),
    5000,
  );
  assert.equal(order.currency, "SAR");
  assert.throws(() => service.create(session, "applepay"), /HTTPS/);
  const apple = readLabConfig({
    ...env,
    MOYASAR_LAB_ORIGIN: "https://lab.example",
    MOYASAR_LAB_APPLE_PAY_ENABLED: "true",
  });
  const store = openLabStore(":memory:");
  t.after(() => store.close());
  const appleOrder = createLabService(store, apple, async () => null).create(
    session,
    "applepay",
  );
  assert.equal(appleOrder.amount, 25000);
  assert.equal(
    appleOrder.items.reduce((sum, item) => sum + item.amount, 0),
    25000,
  );
});

test("only an owned order can obtain checkout data, an intent or verification", async (t) => {
  const { service, order } = setup(t);
  assert.throws(
    () => service.checkout(order.id, "another-session"),
    /not found/,
  );
  await assert.rejects(
    service.intent(order.id, "another-session"),
    /not found/,
  );
  await assert.rejects(
    service.verify(order.id, "another-session"),
    /not found/,
  );
});

test("amount-locked intents are created once, reused under concurrent requests and expire safely", async (t) => {
  let requests = 0,
    approved;
  const { service, store, order } = setup(t, async (path, body) => {
    assert.equal(path, "payment_intents");
    requests++;
    approved = body;
    return {
      id: randomUUID(),
      amount: body.amount,
      currency: body.currency,
      status: "created",
      client_secret: "pi_secret_UNITTEST",
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    };
  });
  const results = await Promise.all([
    service.intent(order.id, session),
    service.intent(order.id, session),
  ]);
  assert.equal(requests, 1);
  assert.deepEqual(results[0], results[1]);
  assert.equal(approved.amount, 5000);
  assert.equal(approved.callback_url, store.order(order.id).callback_url);
  store.saveIntent(order.id, {
    ...JSON.parse(store.order(order.id).intent),
    expires_at: "2000-01-01T00:00:00Z",
  });
  await assert.rejects(service.intent(order.id, session), /expired/);
  assert.equal(requests, 1);
});

test("duplicate and concurrent callbacks create one kitchen ticket and preserve preparation progress", async (t) => {
  let store;
  const state = setup(t, async () => payment(store.order(state.order.id)));
  store = state.store;
  const results = await Promise.all(
    Array.from({ length: 6 }, () =>
      state.service.verify(state.order.id, session),
    ),
  );
  assert.ok(
    results.every((r) => r.paymentState === "paid" && r.kitchen.number === 1),
  );
  assert.equal(store.listKitchen().length, 1);
  assert.equal(store.transition(state.order.id, "paid", "preparing"), true);
  await state.service.verify(state.order.id, session);
  assert.equal(store.listKitchen()[0].status, "preparing");
  assert.equal(store.transition(state.order.id, "paid", "preparing"), false);
  assert.equal(store.transition(state.order.id, "preparing", "ready"), true);
  assert.equal(store.transition(state.order.id, "ready", "paid"), false);
});

test("tampered amounts, currencies, IDs, methods, metadata, environment and callback associations never reach the kitchen", async (t) => {
  for (const override of [
    { amount: 100 },
    { currency: "USD" },
    { id: randomUUID() },
    { live: true },
    { metadata: { lab: "meatery-moyasar-v1", order_id: randomUUID() } },
    { metadata: {} },
    { description: "another order" },
    { callback_url: "https://unrelated.example" },
    { source: { type: "stcpay", company: "mada" } },
    { source: { type: "creditcard", company: "amex" } },
  ]) {
    const store = openLabStore(":memory:");
    try {
      let row;
      const service = createLabService(store, config, async () =>
        payment(row, override),
      );
      const order = service.create(session, "creditcard");
      row = store.order(order.id);
      await assert.rejects(service.verify(order.id, session), /do not match/);
      assert.equal(store.listKitchen().length, 0);
    } finally {
      store.close();
    }
  }
});

test("pending, authorized, failed, refunded and unknown statuses cannot create a paid kitchen order", async (t) => {
  for (const status of [
    "initiated",
    "authorized",
    "failed",
    "refunded",
    "voided",
    "captured",
    "verified",
    "unknown",
  ]) {
    const store = openLabStore(":memory:");
    try {
      let row;
      const service = createLabService(store, config, async () =>
        payment(row, { status }),
      );
      const order = service.create(session, "creditcard");
      row = store.order(order.id);
      try {
        await service.verify(order.id, session);
      } catch (error) {
        assert.match(error.message, /review/);
      }
      assert.equal(store.listKitchen().length, 0, status);
      assert.notEqual(store.order(order.id).payment_state, "paid");
    } finally {
      store.close();
    }
  }
});

test("foreign callback IDs and gateway outages never confirm an order", async (t) => {
  const { service, store, order } = setup(t, async () => {
    throw new Error("simulated gateway timeout");
  });
  await assert.rejects(
    service.verify(order.id, session, randomUUID()),
    /does not belong/,
  );
  await assert.rejects(service.verify(order.id, session), /timeout/);
  assert.equal(store.order(order.id).payment_state, "pending");
  assert.equal(store.listKitchen().length, 0);
});

test("a later verified refund puts a demo ticket on review and blocks kitchen advancement", async (t) => {
  let store,
    refunded = 0;
  const state = setup(t, async () =>
    payment(store.order(state.order.id), { refunded }),
  );
  store = state.store;
  await state.service.verify(state.order.id, session);
  refunded = 2500;
  await assert.rejects(state.service.verify(state.order.id, session), /review/);
  assert.equal(store.listKitchen()[0].paymentState, "review");
  assert.equal(store.transition(state.order.id, "paid", "preparing"), false);
});

test("paid orders and their kitchen status survive a local database restart without duplicate tickets", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "meatery-lab-test-"));
  const path = join(dir, "isolated.sqlite");
  let store = openLabStore(path);
  let row;
  try {
    let service = createLabService(store, config, async () => payment(row));
    const order = service.create(session, "creditcard");
    row = store.order(order.id);
    await service.verify(order.id, session);
    store.transition(order.id, "paid", "preparing");
    store.close();
    store = openLabStore(path);
    service = createLabService(store, config, async () => payment(row));
    await service.verify(order.id, session);
    assert.equal(store.listKitchen().length, 1);
    assert.equal(store.listKitchen()[0].status, "preparing");
  } finally {
    store.close();
    rmSync(dir, { recursive: true });
  }
});

test("reconciliation can recover a paid test without a browser callback", async (t) => {
  let state;
  state = setup(t, async () => payment(state.row));
  state.store.saveIntent(state.order.id, { id: randomUUID() });
  await state.service.reconcile();
  assert.equal(state.store.listKitchen().length, 1);
});

test("gateway transport uses test secret server-side and sanitises upstream errors", async () => {
  const gateway = createGateway(
    "sk_test_UNITTESTONLY",
    async (url, options) => {
      assert.equal(url, "https://api.moyasar.com/v1/payments/test");
      assert.equal(options.redirect, "error");
      assert.ok(options.headers.Authorization.startsWith("Basic "));
      return new Response("PRIVATE_UPSTREAM_RESPONSE", { status: 401 });
    },
  );
  await assert.rejects(
    gateway("payments/test"),
    (error) => !error.message.includes("PRIVATE_UPSTREAM_RESPONSE"),
  );
  assert.throws(() => createGateway("sk_live_REJECT"));
});

test("HTTP API protects staff access, rejects card fields and foreign origins, and isolates guest orders", async (t) => {
  const store = openLabStore(":memory:");
  const { server } = createLabServer({
    config,
    store,
    gateway: async () => null,
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    store.close();
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const call = (path, options = {}) =>
    fetch(`${origin}/lab-api/moyasar${path}`, options);
  const write = (body) => ({
    method: "POST",
    headers: { Origin: config.origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  assert.equal((await call("/kitchen")).status, 401);
  assert.equal(
    (
      await call("/kitchen", {
        headers: { Authorization: `Bearer ${config.kitchenKey}` },
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await call("/orders", {
        ...write({}),
        headers: { ...write({}).headers, Origin: "https://attacker.example" },
      })
    ).status,
    403,
  );
  assert.equal(
    (await call("/orders", write({ number: "DO_NOT_ACCEPT_CARD_FIELDS" })))
      .status,
    400,
  );
  assert.equal((await call("/orders", write({ amount: 1 }))).status, 400);
  const response = await call("/orders", write({ method: "creditcard" }));
  assert.equal(response.status, 201);
  const cookie = response.headers.get("set-cookie");
  assert.match(cookie, /HttpOnly; SameSite=Lax/);
  const order = await response.json();
  assert.equal(order.amount, 5000);
  assert.equal((await call(`/orders/${order.id}`)).status, 401);
  const own = await call(`/orders/${order.id}`, {
    headers: { Cookie: cookie.split(";")[0] },
  });
  assert.equal(own.status, 200);
  const configuration = JSON.stringify(await (await call("/config")).json());
  assert.ok(!configuration.includes(config.secretKey));
  assert.ok(!configuration.includes(config.kitchenKey));
});
