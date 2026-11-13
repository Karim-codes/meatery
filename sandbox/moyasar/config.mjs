export function readLabConfig(env) {
  if (
    env.MOYASAR_LAB_ENABLED !== "true" ||
    env.VERCEL ||
    env.NODE_ENV === "production"
  ) {
    throw new Error(
      "The Moyasar lab is local-only and must be explicitly enabled outside production.",
    );
  }
  for (const [name, value] of Object.entries(env)) {
    if (
      name.startsWith("VITE_") &&
      (/SECRET|KITCHEN|PRIVATE/i.test(name) || /^sk_/.test(value || ""))
    ) {
      throw new Error(
        "Private credentials must never use Vite's public variable prefix.",
      );
    }
  }
  const publishableKey = env.VITE_MOYASAR_PUBLISHABLE_KEY || "";
  const secretKey = env.MOYASAR_SECRET_KEY || "";
  if (publishableKey && !/^pk_test_[a-zA-Z0-9]+$/.test(publishableKey)) {
    throw new Error("Only a Moyasar pk_test_ publishable key is accepted.");
  }
  if (secretKey && !/^sk_test_[a-zA-Z0-9]+$/.test(secretKey)) {
    throw new Error("Only a Moyasar sk_test_ server secret is accepted.");
  }
  const url = new URL(env.MOYASAR_LAB_ORIGIN || "http://localhost:5174");
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (
    (url.protocol !== "https:" && !(url.protocol === "http:" && local)) ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error(
      "Use an exact HTTPS lab origin, or HTTP localhost for card testing.",
    );
  }
  const kitchenKey = env.MOYASAR_LAB_KITCHEN_KEY || "";
  if (kitchenKey && kitchenKey.length < 32)
    throw new Error("Use a kitchen key of at least 32 characters.");
  const port = Number(env.MOYASAR_LAB_API_PORT || 8787);
  if (!Number.isInteger(port) || port < 1024 || port > 65535)
    throw new Error("Invalid lab API port.");
  const appleAmount = Number(env.MOYASAR_LAB_APPLE_PAY_AMOUNT_HALALAS || 25000);
  if (
    !Number.isSafeInteger(appleAmount) ||
    appleAmount < 100 ||
    appleAmount > 1000000
  ) {
    throw new Error(
      "Apple Pay test amount must be an integer from 100 to 1000000 halalas.",
    );
  }
  return {
    origin: url.origin,
    port,
    secretKey,
    publishableKey,
    kitchenKey,
    ready: Boolean(secretKey && publishableKey),
    appleEnabled:
      env.MOYASAR_LAB_APPLE_PAY_ENABLED === "true" && url.protocol === "https:",
    appleAmount,
  };
}
