const BASE = "/lab-api/moyasar";
export async function labRequest(path, { method = "GET", body, token } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${BASE}${path}`, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(
        "The local sandbox API is unavailable. Start it with npm run lab:moyasar.",
      );
    }
    if (!response.ok)
      throw new Error(
        data.error || "The sandbox request could not be completed.",
      );
    return data;
  } catch (error) {
    if (error.name === "AbortError" || error instanceof TypeError)
      throw new Error(
        "Connection interrupted. Check this test's payment status before trying another payment.",
      );
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

let sdk;
export function loadMoyasarForm() {
  if (sdk) return sdk;
  sdk = new Promise((resolve, reject) => {
    const base =
      "https://cdn.jsdelivr.net/npm/moyasar-payment-form@2.3.0/dist/";
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = `${base}moyasar.css`;
    css.integrity =
      "sha384-kXA6TcBKVzqpjpsbaJciletoxOQ3kNhUKCCMPpZaXA2MOhJMTaqVspZdFxXo5iTA";
    css.crossOrigin = "anonymous";
    const script = document.createElement("script");
    script.src = `${base}moyasar.umd.min.js`;
    script.integrity =
      "sha384-1EtqiHfTdzVtlk1ChJ9HeyrZU7ScCc9S+vN8eiUDIeJmcv7kx5TJG0dWoxQOcVJB";
    script.crossOrigin = "anonymous";
    script.async = true;
    let loaded = 0;
    const timeout = setTimeout(fail, 15000);
    function fail() {
      clearTimeout(timeout);
      css.remove();
      script.remove();
      sdk = null;
      reject(
        new Error(
          "Moyasar's official form could not load. Check your connection and reload; no payment has been submitted by this page.",
        ),
      );
    }
    function ready() {
      if (++loaded !== 2) return;
      clearTimeout(timeout);
      if (!window.Moyasar?.init) return fail();
      resolve(window.Moyasar);
    }
    css.onload = ready;
    script.onload = ready;
    css.onerror = fail;
    script.onerror = fail;
    document.head.append(css, script);
  });
  return sdk;
}
