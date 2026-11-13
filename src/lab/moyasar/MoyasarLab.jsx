import React, { useEffect, useRef, useState } from "react";
import { Brand } from "../../components/Brand";
import { BrandMark } from "../../components/BrandMark";
import { Arrow } from "../../components/Icons";
import { RiyalSymbol } from "../../components/RiyalPrice";
import { labRequest, loadMoyasarForm } from "./api";
import "./lab.css";

const ROOT = "/lab/moyasar";
const UUID = /^[0-9a-f-]{36}$/i;
const placeholder = {
  amount: 5000,
  currency: "SAR",
  items: [
    { name: "Smash Burger", quantity: 1, amount: 3000 },
    { name: "Fries", quantity: 1, amount: 1200 },
    { name: "Drink", quantity: 1, amount: 800 },
  ],
};
function Money({ amount }) {
  return (
    <span
      className="lab-money"
      aria-label={`${(amount / 100).toFixed(2)} Saudi riyals`}
    >
      <RiyalSymbol />
      <span aria-hidden="true">{(amount / 100).toFixed(2)}</span>
    </span>
  );
}
function Notice({ children, error = false }) {
  return (
    <div
      className={`lab-notice${error ? " lab-notice--error" : ""}`}
      role={error ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
function Lock() {
  return (
    <svg
      width="16"
      height="18"
      viewBox="0 0 20 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      <rect x="3" y="9" width="14" height="11" rx="1" />
      <path d="M6 9V6a4 4 0 0 1 8 0v3M10 13v3" />
    </svg>
  );
}
function OrderSummary({ order = placeholder, number }) {
  return (
    <aside className="lab-summary" aria-label="Fictional test order">
      <div className="lab-summary-photo">
        <img src="/images/menu-burger.jpg" alt="" />
        <span>FIRE. CRAFT. A LITTLE EXPERIMENT.</span>
      </div>
      <div className="lab-summary-content">
        <div className="lab-eyebrow">
          01 /{" "}
          {number
            ? `DEMO ORDER M${String(number).padStart(4, "0")}`
            : "YOUR TEST ORDER"}
        </div>
        <h2>
          Good things.
          <br />
          <em>Tested properly.</em>
        </h2>
        <ul className="lab-items">
          {order.items.map((item) => (
            <li key={item.name}>
              <span>
                <small>{item.quantity} ×</small> {item.name}
              </span>
              <Money amount={item.amount * item.quantity} />
            </li>
          ))}
        </ul>
        <div className="lab-total">
          <span>
            Total <small>SAR</small>
          </span>
          <Money amount={order.amount} />
        </div>
        <p className="lab-small">
          A fictional order for payment testing. This will never be sent to
          Meatery’s real kitchen.
        </p>
      </div>
    </aside>
  );
}
function PaymentForm({ order, onError }) {
  const element = useRef(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  useEffect(() => {
    let active = true;
    const node = element.current;
    const publishableKey = import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY || "";
    if (!/^pk_test_[a-zA-Z0-9]+$/.test(publishableKey)) {
      onError(
        "A valid VITE_MOYASAR_PUBLISHABLE_KEY test key is required. Restart the lab after configuring it.",
      );
      setLoading(false);
      return;
    }
    loadMoyasarForm()
      .then((Moyasar) => {
        if (!active) return;
        Moyasar.init({
          element: node,
          amount: order.amount,
          currency: "SAR",
          description: order.description,
          publishable_api_key: publishableKey,
          callback_url: order.callbackUrl,
          methods: [order.method],
          supported_networks: ["mada", "visa", "mastercard"],
          given_id: order.paymentId,
          metadata: { lab: "meatery-moyasar-v1", order_id: order.id },
          language: "en",
          fixed_width: false,
          use_payment_intent: true,
          credit_card: { save_card: false, manual: false },
          ...(order.method === "applepay"
            ? {
                apple_pay: {
                  country: "SA",
                  label: "Meatery Sandbox",
                  validate_merchant_url:
                    "https://api.moyasar.com/v1/applepay/initiate",
                  manual: false,
                  save_card: false,
                },
              }
            : {}),
          on_initiating: async () => {
            if (active) {
              setProcessing(true);
              onError("");
            }
            try {
              const intent = await labRequest(`/orders/${order.id}/intent`, {
                method: "POST",
                body: {},
              });
              return { payment_intent: intent };
            } catch (error) {
              if (active) {
                onError(error.message);
                setProcessing(false);
              }
              return false;
            }
          },
          on_completed: async (payment) => {
            try {
              await labRequest(`/orders/${order.id}/verify`, {
                method: "POST",
                body: { paymentId: payment.id },
              });
            } catch {
              /* Return/3DS continues. The result page retries authoritative verification. */
            }
          },
          on_failure: async () => {
            if (active) {
              setProcessing(false);
              onError(
                "The sandbox payment could not finish. Check its verified status below before starting another test.",
              );
            }
          },
        });
        setLoading(false);
      })
      .catch((error) => {
        if (active) {
          onError(error.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
      node.replaceChildren();
    };
  }, [order]);
  return (
    <>
      {loading && <Notice>Loading Moyasar’s official payment form…</Notice>}
      <div className="lab-moyasar-form" ref={element} />
      {processing && (
        <Notice>
          <span className="lab-spinner" />
          Processing with Moyasar. Complete any bank verification; keep this
          page open.
        </Notice>
      )}
      <a className="lab-inline-link" href={`${ROOT}/result?order=${order.id}`}>
        Check this test’s payment status <Arrow diagonal />
      </a>
    </>
  );
}
function Checkout() {
  const [config, setConfig] = useState(null);
  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState("creditcard");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastOrder, setLastOrder] = useState("");
  useEffect(() => {
    let active = true;
    labRequest("/config")
      .then((value) => {
        if (active) setConfig(value);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    try {
      setLastOrder(sessionStorage.getItem("meatery-moyasar-last-test") || "");
    } catch {
      /* Optional convenience only. */
    }
    return () => {
      active = false;
    };
  }, []);
  const appleCapable = Boolean(
    config?.appleEnabled &&
    window.isSecureContext &&
    window.ApplePaySession?.canMakePayments?.(),
  );
  async function start() {
    setBusy(true);
    setError("");
    try {
      const result = await labRequest("/orders", {
        method: "POST",
        body: { method },
      });
      setOrder(result);
      try {
        sessionStorage.setItem("meatery-moyasar-last-test", result.id);
      } catch {
        /* Order access is protected by the HttpOnly session cookie. */
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const summary =
    order ||
    (method === "applepay" && config
      ? {
          ...config,
          amount: config.appleAmount,
          items: [
            ...config.items,
            {
              name: "Apple Pay sandbox amount adjustment",
              quantity: 1,
              amount: config.appleAmount - 5000,
            },
          ],
        }
      : config || placeholder);
  return (
    <>
      <div className="lab-intro">
        <p className="lab-eyebrow">MEATERY / PAYMENT PLAYGROUND</p>
        <h1>
          A table for <em>testing.</em>
        </h1>
        <p>
          Explore checkout, from the first tap to a verified kitchen ticket.
        </p>
      </div>
      <div className="lab-checkout-grid">
        <OrderSummary order={summary} />
        <section className="lab-payment" aria-labelledby="payment-title">
          <div className="lab-eyebrow">02 / SANDBOX CHECKOUT</div>
          <h2 id="payment-title">
            Pay a little.
            <br />
            <em>Learn a lot.</em>
          </h2>
          <div className="lab-methods">
            <span>mada</span>
            <span>VISA</span>
            <span>Mastercard</span>
          </div>
          <p className="lab-body-copy">
            Test credentials only. Card details go directly to Moyasar through
            its official form.
          </p>
          {error && <Notice error>{error}</Notice>}
          {!config && !error && (
            <Notice>Connecting to the local payment sandbox…</Notice>
          )}
          {config && !config.ready && (
            <div className="lab-setup">
              <span className="lab-eyebrow">CONFIGURATION REQUIRED</span>
              <h3>Ready when your test keys are.</h3>
              <p>
                Add your publishable and secret test keys to{" "}
                <code>.env.moyasar-lab.local</code>, then restart{" "}
                <code>npm run lab:moyasar</code>.
              </p>
              <p>
                Never paste a secret key into this page or prefix it with{" "}
                <code>VITE_</code>.
              </p>
            </div>
          )}
          {config?.ready && !order && (
            <>
              {appleCapable && (
                <fieldset className="lab-method-choice">
                  <legend>Choose a test method</legend>
                  <label>
                    <input
                      type="radio"
                      name="method"
                      checked={method === "creditcard"}
                      onChange={() => setMethod("creditcard")}
                    />{" "}
                    Card / 50.00 SAR
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="method"
                      checked={method === "applepay"}
                      onChange={() => setMethod("applepay")}
                    />{" "}
                    Apple Pay / {(config.appleAmount / 100).toFixed(2)} SAR
                  </label>
                </fieldset>
              )}
              <button
                className="lab-button"
                type="button"
                disabled={busy}
                onClick={start}
              >
                {busy ? "Preparing your test…" : "Continue to test payment"}
                <Arrow diagonal />
              </button>
            </>
          )}
          {order && <PaymentForm order={order} onError={setError} />}
          <div className="lab-apple-note">
            <span>APPLE PAY</span>
            <p>
              {!config?.appleEnabled
                ? "Setup required: register the HTTPS lab domain in Moyasar. Card testing is available independently."
                : !appleCapable
                  ? "Configured for this lab, but this browser does not report an available Apple Pay wallet. Use card checkout on this device."
                  : `Available on this device. Uses a separate ${(config.appleAmount / 100).toFixed(2)} SAR sandbox amount.`}
            </p>
          </div>
          <p className="lab-secure">
            <Lock />
            No real restaurant orders. No saved card details.
          </p>
          {UUID.test(lastOrder) && !order && (
            <a
              className="lab-inline-link"
              href={`${ROOT}/result?order=${lastOrder}`}
            >
              Resume your last test <Arrow diagonal />
            </a>
          )}
        </section>
      </div>
    </>
  );
}
function Result() {
  const query = new URLSearchParams(window.location.search);
  const id = query.get("order") || "";
  const paymentId = query.get("id");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true,
      timer,
      count = 0;
    if (!UUID.test(id) || (paymentId && !UUID.test(paymentId))) {
      setError("A valid sandbox order and payment reference are required.");
      setChecking(false);
      return;
    }
    async function check() {
      setChecking(true);
      try {
        const verified = await labRequest(`/orders/${id}/verify`, {
          method: "POST",
          body: paymentId ? { paymentId } : {},
        });
        if (!active) return;
        setOrder(verified);
        setError("");
        if (verified.paymentState === "pending" && ++count < 10)
          timer = setTimeout(check, 4000);
        else setChecking(false);
      } catch (e) {
        if (active) {
          setError(e.message);
          setChecking(false);
        }
      }
    }
    check();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [id, paymentId, refresh]);
  const state = order?.paymentState || "pending";
  const success = state === "paid" && !error;
  return (
    <>
      <div className="lab-intro">
        <p className="lab-eyebrow">MEATERY / PAYMENT VERIFICATION</p>
        <h1>
          {success ? (
            <>
              Verified.
              <br />
              <em>From server to kitchen.</em>
            </>
          ) : state === "failed" ? (
            <>
              This test was <em>declined.</em>
            </>
          ) : (
            <>
              Every detail.
              <br />
              <em>Checked first.</em>
            </>
          )}
        </h1>
        <p>
          {success
            ? "Moyasar confirmed payment and your demo kitchen ticket has been saved."
            : "Only a payment retrieved and checked by our server can become a kitchen order."}
        </p>
      </div>
      <div className="lab-checkout-grid">
        <OrderSummary
          order={order || placeholder}
          number={order?.kitchen?.number}
        />
        <section className="lab-payment">
          <span className="lab-eyebrow">02 / VERIFIED RESULT</span>
          <h2>
            {success
              ? "Paid. Verified."
              : checking
                ? "Checking payment…"
                : state === "failed"
                  ? "Payment failed."
                  : "Not yet confirmed."}
          </h2>
          {error && <Notice error>{error}</Notice>}
          {success ? (
            <div className="lab-result-details">
              <BrandMark />
              <dl>
                <div>
                  <dt>Demo kitchen ticket</dt>
                  <dd>M{String(order.kitchen.number).padStart(4, "0")}</dd>
                </div>
                <div>
                  <dt>Payment</dt>
                  <dd>Paid / server verified</dd>
                </div>
                <div>
                  <dt>Method</dt>
                  <dd>{order.kitchen.method}</dd>
                </div>
                <div>
                  <dt>Kitchen status</dt>
                  <dd>{order.kitchen.status}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="lab-body-copy">
              {state === "failed"
                ? "The test transaction was declined. No kitchen ticket was created. You can start a fresh test with another official sandbox card."
                : "No successful payment has been confirmed. If you completed bank verification, check again. Do not submit another payment while the result is uncertain."}
            </p>
          )}
          {!success && (
            <button
              className="lab-button"
              disabled={checking}
              onClick={() => setRefresh((n) => n + 1)}
            >
              {checking ? "Verifying with Moyasar…" : "Check payment again"}
              <Arrow diagonal />
            </button>
          )}
          {(success || state === "failed") && (
            <a className="lab-inline-link" href={ROOT}>
              Start a new sandbox test <Arrow diagonal />
            </a>
          )}
          <a className="lab-inline-link" href={`${ROOT}/kitchen`}>
            Open the demo kitchen <Arrow diagonal />
          </a>
        </section>
      </div>
    </>
  );
}
function Kitchen() {
  const [input, setInput] = useState("");
  const [token, setToken] = useState("");
  const [orders, setOrders] = useState([]);
  const [updated, setUpdated] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (!token) return;
    let active = true,
      timer;
    async function poll() {
      try {
        const data = await labRequest("/kitchen", { token });
        if (active) {
          setOrders(data.orders);
          setUpdated(data.updatedAt);
          setError("");
        }
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) timer = setTimeout(poll, 4000);
      }
    }
    poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [token, refresh]);
  async function move(order) {
    setBusy(order.id);
    setError("");
    try {
      const data = await labRequest(`/kitchen/${order.id}`, {
        method: "PATCH",
        token,
        body: {
          from: order.status,
          to: order.status === "paid" ? "preparing" : "ready",
        },
      });
      setOrders(data.orders);
      setUpdated(data.updatedAt);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
      setRefresh((n) => n + 1);
    }
  }
  return (
    <>
      <div className="lab-intro">
        <p className="lab-eyebrow">MEATERY / DEMO KITCHEN</p>
        <h1>
          From fire <em>to finish.</em>
        </h1>
        <p>
          Verified sandbox payments only. This board is separate from restaurant
          operations.
        </p>
      </div>
      {!token ? (
        <form
          className="lab-login"
          onSubmit={(event) => {
            event.preventDefault();
            setToken(input);
            setInput("");
          }}
        >
          <h2>Kitchen access.</h2>
          <p>
            Use the local sandbox kitchen key. It stays in memory for this tab
            and is cleared when you reload.
          </p>
          <label htmlFor="lab-kitchen-key">Sandbox kitchen access key</label>
          <input
            id="lab-kitchen-key"
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            required
            minLength={32}
          />
          <button className="lab-button">
            Open demo kitchen <Arrow diagonal />
          </button>
          <p className="lab-small">
            Set <code>MOYASAR_LAB_KITCHEN_KEY</code> in your ignored local
            environment file. This is a demo access gate, not a production staff
            account.
          </p>
        </form>
      ) : (
        <>
          <div className="lab-kitchen-toolbar">
            <p role="status">
              {error
                ? "Connection interrupted / board may be stale"
                : updated
                  ? `Last synced ${new Date(updated).toLocaleTimeString()}`
                  : "Connecting…"}
            </p>
            <button type="button" onClick={() => setRefresh((n) => n + 1)}>
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                setToken("");
                setOrders([]);
                setUpdated("");
                setError("");
              }}
            >
              Lock kitchen
            </button>
          </div>
          {error && <Notice error>{error}</Notice>}
          <div className="lab-kitchen-board">
            {["paid", "preparing", "ready"].map((status) => (
              <section
                className="lab-kitchen-column"
                key={status}
                aria-label={`${status} demo orders`}
              >
                <h2>
                  {status}
                  <span>
                    {orders.filter((o) => o.status === status).length}
                  </span>
                </h2>
                {orders
                  .filter((o) => o.status === status)
                  .map((order) => (
                    <article className="lab-ticket" key={order.id}>
                      <div className="lab-ticket-heading">
                        <strong>
                          M{String(order.number).padStart(4, "0")}
                        </strong>
                        <span>
                          {order.paymentState === "paid"
                            ? "TEST / PAID"
                            : "REVIEW REQUIRED"}
                        </span>
                      </div>
                      <ul>
                        {order.items.map((item) => (
                          <li key={item.name}>
                            {item.quantity} × {item.name}
                          </li>
                        ))}
                      </ul>
                      <p className="lab-small">{order.method}</p>
                      <Money amount={order.amount} />
                      {status !== "ready" && (
                        <button
                          type="button"
                          className="lab-button"
                          disabled={
                            Boolean(busy) || order.paymentState !== "paid"
                          }
                          onClick={() => move(order)}
                        >
                          {busy === order.id
                            ? "Updating…"
                            : status === "paid"
                              ? "Start preparing"
                              : "Mark ready"}
                          <Arrow />
                        </button>
                      )}
                    </article>
                  ))}
                {!orders.some((o) => o.status === status) && (
                  <p className="lab-empty">No {status} tests yet.</p>
                )}
              </section>
            ))}
          </div>
        </>
      )}
    </>
  );
}
export default function MoyasarLab() {
  useEffect(() => {
    document.title = "Meatery / Moyasar Sandbox";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.append(robots);
    return () => robots.remove();
  }, []);
  const path = window.location.pathname.replace(/\/$/, "");
  return (
    <div className="moyasar-lab" dir="ltr" lang="en">
      <header className="lab-header">
        <Brand />
        <span className="lab-badge">SANDBOX / TEST PAYMENT</span>
        <nav aria-label="Sandbox navigation">
          <a href={ROOT}>Checkout</a>
          <a href={`${ROOT}/kitchen`}>Demo kitchen</a>
        </nav>
      </header>
      <main className="lab-main">
        {path === `${ROOT}/kitchen` ? (
          <Kitchen />
        ) : path === `${ROOT}/result` ? (
          <Result />
        ) : (
          <Checkout />
        )}
      </main>
      <footer className="lab-footer">
        <span>MEATERY / MADINAH</span>
        <span>EXPERIMENT ONLY. NO LIVE PAYMENTS.</span>
        <a href="/menu">
          Back to the restaurant menu <Arrow diagonal />
        </a>
      </footer>
    </div>
  );
}
