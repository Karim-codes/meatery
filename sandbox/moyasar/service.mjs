export class LabError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createGateway(secretKey, fetchImpl = fetch) {
  if (!/^sk_test_[a-zA-Z0-9]+$/.test(secretKey))
    throw new Error("Sandbox secret key required.");
  return async (path, body) => {
    let response;
    try {
      response = await fetchImpl(`https://api.moyasar.com/v1/${path}`, {
        method: body ? "POST" : "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        redirect: "error",
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      throw new LabError(
        503,
        "Moyasar could not be reached. Keep this order and check again; do not pay twice.",
      );
    }
    if (response.status === 404) return null;
    if (!response.ok)
      throw new LabError(
        502,
        "Moyasar rejected the request. Check the sandbox account configuration before retrying.",
      );
    try {
      return await response.json();
    } catch {
      throw new LabError(
        502,
        "Moyasar returned an unreadable response. Verification is still pending.",
      );
    }
  };
}

export function createLabService(store, config, gateway) {
  const locks = new Map();
  async function locked(id, work) {
    const previous = locks.get(id) || Promise.resolve();
    const next = previous.catch(() => {}).then(work);
    locks.set(id, next);
    try {
      return await next;
    } finally {
      if (locks.get(id) === next) locks.delete(id);
    }
  }
  function requireReady() {
    if (!config.ready)
      throw new LabError(
        503,
        "Add both Moyasar test keys locally to enable sandbox transactions.",
      );
  }
  function owned(id, sessionHash) {
    if (!UUID.test(id)) throw new LabError(404, "Test order not found.");
    const row = store.order(id);
    if (!row || row.session_hash !== sessionHash)
      throw new LabError(404, "Test order not found in this browser session.");
    return row;
  }
  async function verifyRow(row, paymentId = row.payment_id) {
    requireReady();
    if (!UUID.test(paymentId) || paymentId !== row.payment_id)
      throw new LabError(409, "Payment does not belong to this test order.");
    const payment = await gateway(`payments/${row.payment_id}`);
    if (!payment) return store.publicOrder(store.order(row.id));
    const matches =
      payment.id === row.payment_id &&
      payment.amount === row.amount &&
      payment.currency === "SAR" &&
      payment.live !== true &&
      payment.metadata?.lab === "meatery-moyasar-v1" &&
      payment.metadata?.order_id === row.id &&
      payment.description === row.description &&
      payment.callback_url === row.callback_url &&
      payment.source?.type === row.method &&
      ["mada", "visa", "master", "mastercard"].includes(
        payment.source?.company,
      );
    if (!matches)
      throw new LabError(
        409,
        "Payment details do not match this sandbox order. No kitchen order was created.",
      );
    if (payment.status === "paid" && !payment.refunded && !payment.voided_at) {
      const method = `${payment.source.type} / ${payment.source.company}`;
      return store.verified(row, method);
    }
    if (
      ["refunded", "voided", "captured"].includes(payment.status) ||
      payment.refunded > 0 ||
      payment.voided_at
    ) {
      store.setState(row.id, "review");
      throw new LabError(
        409,
        "Payment requires manual sandbox review. It is not a newly verified paid order.",
      );
    }
    if (["failed", "expired"].includes(payment.status))
      store.setState(row.id, "failed");
    // initiated, authorized and unknown states never enter the kitchen.
    return store.publicOrder(store.order(row.id));
  }
  return {
    owned,
    create(sessionHash, method) {
      requireReady();
      if (!["creditcard", "applepay"].includes(method))
        throw new LabError(400, "Unsupported test payment method.");
      if (method === "applepay" && !config.appleEnabled)
        throw new LabError(
          409,
          "Register the HTTPS lab domain before enabling Apple Pay.",
        );
      return store.publicOrder(
        store.create(
          sessionHash,
          method,
          method === "applepay" ? config.appleAmount : 5000,
          config.origin,
        ),
      );
    },
    async intent(id, sessionHash) {
      requireReady();
      return locked(id, async () => {
        const row = owned(id, sessionHash);
        if (row.payment_state !== "pending")
          throw new LabError(
            409,
            "This test has finished. Start a new test instead.",
          );
        let intent = row.intent ? JSON.parse(row.intent) : null;
        if (intent && Date.parse(intent.expires_at) <= Date.now())
          throw new LabError(
            409,
            "Checkout expired. Start a new sandbox test.",
          );
        if (!intent) {
          intent = await gateway("payment_intents", {
            amount: row.amount,
            currency: "SAR",
            description: row.description,
            callback_url: row.callback_url,
          });
          if (
            !intent ||
            !UUID.test(intent.id) ||
            !/^pi_secret_/.test(intent.client_secret || "") ||
            intent.amount !== row.amount ||
            intent.currency !== "SAR" ||
            intent.status !== "created" ||
            !(Date.parse(intent.expires_at) > Date.now())
          )
            throw new LabError(
              502,
              "Unexpected payment intent. No checkout was authorised.",
            );
          store.saveIntent(id, intent);
        }
        return { id: intent.id, client_secret: intent.client_secret };
      });
    },
    checkout(id, sessionHash) {
      const row = owned(id, sessionHash);
      return {
        ...store.publicOrder(row),
        paymentId: row.payment_id,
        callbackUrl: row.callback_url,
        description: row.description,
      };
    },
    verify(id, sessionHash, paymentId) {
      return locked(id, () => verifyRow(owned(id, sessionHash), paymentId));
    },
    async reconcile() {
      for (const row of store.pending()) {
        try {
          await locked(row.id, () => verifyRow(store.order(row.id)));
        } catch {
          /* The durable pending order remains available for manual retry. No secrets/payloads are logged. */
        }
      }
    },
  };
}
