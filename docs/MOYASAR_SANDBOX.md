# Meatery / Moyasar sandbox experiment

This is a local experiment on `experiment/moyasar-payments`, not a production ordering launch. On 13 November 2026 the owner requested that it be parked and saved to this branch on GitHub. Keep it separate from `main`; do not merge or deploy the payment lab without a new explicit request. No live credentials, real restaurant orders or production databases are used. The existing homepage, 42-item bilingual menu and printed QR destination are unchanged.

Only source code and the empty environment template belong in the branch. Actual credentials, kitchen access keys, local SQLite data and generated lab bundles stay ignored on the developer's machine. A normal hosting build excludes the payment lab, including when a hosting service creates a preview for this branch. The payment experiment still requires its separate local API and database.

## Architecture inspected

- React 19 + Vite 7, npm/package-lock, pathname routing in `src/main.jsx`.
- The repository started with no backend, cart, authentication, payment integration or real-time service. Prices in the real menu remain illustrative estimates.
- The existing Vercel configuration serves a static SPA. It is unchanged; this experiment does not add Vercel Functions or hosted storage.
- Existing Brand, BrandMark, SVG arrows and official riyal geometry are reused. The lab is an English-only development tool, with explicit LTR layout even when the restaurant's saved language is Arabic. Existing public Arabic/English behaviour is preserved.
- A separate Node HTTP API, using Node's built-in SQLite module, persists sandbox-only state under `.sandbox/moyasar-lab.sqlite`. This requires Node 22.17+; this environment was verified with 22.17.0. That Node release labels SQLite experimental and prints a warning.
- The browser fulfils a server-created Moyasar payment intent using the official Payment Form 2.3.0. The server fetches the resulting payment independently. A database transaction records verification and a unique demo kitchen ticket together.

## Files

| File | Purpose |
| --- | --- |
| `.env.moyasar-lab.example` | Empty template; no actual keys |
| `.gitignore` | Excludes actual env files, SQLite data and lab build output |
| `vite.config.mjs` | Lab-mode-only local proxy; blocks access to backend/database/env files |
| `scripts/run-moyasar-lab.mjs` | Checks experiment branch and runs Vite plus the API |
| `sandbox/moyasar/config.mjs` | Test-only configuration and production/live-key guards |
| `sandbox/moyasar/server.mjs` | Loopback-only API entry and private local database |
| `sandbox/moyasar/app.mjs` | JSON endpoints, guest sessions, staff access and polling reconciliation |
| `sandbox/moyasar/store.mjs` | Fixed test basket, durable orders and atomic kitchen state |
| `sandbox/moyasar/service.mjs` | Gateway transport, intent creation and authoritative verification |
| `src/main.jsx` | Lazy lab route loading only in explicitly enabled `moyasar-lab` mode |
| `src/lab/moyasar/` | Checkout, result, kitchen, official SDK loader and scoped styles |
| `tests/moyasar-lab.test.js` | Isolated verification, idempotency, persistence and HTTP security tests |
| `README.md` | Link to these instructions |

No dependencies were added. The official form's JS/CSS load from the pinned jsDelivr URLs used in Moyasar's current documentation, with SHA-384 integrity checks, only after a configured checkout starts. SDK asset downloads are not included in the existing public menu.

## Start locally

Remain on `experiment/moyasar-payments`. With Node 22.17+ and existing dependencies installed:

```bash
cp .env.moyasar-lab.example .env.moyasar-lab.local
```

Skip the copy if your local file already exists. Edit that ignored file locally:

```dotenv
MOYASAR_LAB_ENABLED=true
VITE_MOYASAR_LAB_ENABLED=true
VITE_MOYASAR_PUBLISHABLE_KEY=pk_test_YOUR_OWN_PUBLISHABLE_KEY
MOYASAR_SECRET_KEY=sk_test_YOUR_OWN_SECRET_KEY
MOYASAR_LAB_KITCHEN_KEY=YOUR_RANDOM_LOCAL_KITCHEN_KEY_AT_LEAST_32_CHARACTERS
MOYASAR_LAB_ORIGIN=http://localhost:5174
MOYASAR_LAB_API_PORT=8787
MOYASAR_LAB_APPLE_PAY_ENABLED=false
MOYASAR_LAB_APPLE_PAY_AMOUNT_HALALAS=25000
```

The example key suffixes above are explanatory placeholders, not usable credentials. Obtain both keys from your own Moyasar dashboard in test mode. Never use `pk_live_` or `sk_live_`. Never give a secret or kitchen key a `VITE_` prefix: Vite exposes that prefix to browser code, and the lab rejects such configurations.

Generate the local kitchen key with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Keep the generated value local. After saving configuration:

```bash
npm run lab:moyasar
```

Open these **localhost** URLs, matching the configured origin exactly:

- `http://localhost:5174/lab/moyasar` — checkout.
- `http://localhost:5174/lab/moyasar/result?order=ORDER_UUID` — payment result/recovery.
- `http://localhost:5174/lab/moyasar/kitchen` — gated demo kitchen.

Use localhost rather than `127.0.0.1` in the browser when the configured origin is localhost. The API listens only on `127.0.0.1:8787`; Vite proxies `/lab-api/moyasar`. Ports are strict so a different running server cannot silently take over the callback origin. Restart both processes after changing env values. Ctrl+C stops both.

Without test keys, the lab runs with an explicit setup-required screen; it never simulates a successful payment. With keys, “Continue to test payment” creates a pending fixture before mounting the form. The `MOYASAR_SECRET_KEY` exists only in the server process; the publishable test key reaches the frontend through `import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY`.

`npm run dev` and `npm run build` continue to serve/build the normal restaurant site. Both build mode and the explicit public lab flag are required to include the lab. `npm run build:lab` makes a **local inspection bundle** in ignored `dist-lab/`; it does not package the API or make a working standalone static payment deployment. Do not deploy it. Lab configuration is refused on Vercel, and the backend refuses production mode.

## Genuine sandbox card tests

Use your own test keys and only the numbers in [Moyasar's official test-card guide](https://docs.moyasar.com/guides/card-payments/test-cards). Enter them only in Moyasar's official form in the browser, never in a request to our API. Do not use real cards for card-form testing.

The fixed basket is Smash Burger 30 SAR, Fries 12 SAR and Drink 8 SAR: **50.00 SAR / 5000 halalas**, all fictional.

| Scenario | Official test card | Expected outcome |
| --- | --- | --- |
| Successful mada | `4201320111111010` | Verified paid result and one kitchen ticket |
| Declined mada | `4201321234411220` | Failed result and no kitchen ticket |
| Successful Visa | `4111111111111111` | Verified paid result and one kitchen ticket |
| Successful Mastercard | `5421080101000000` | Verified paid result and one kitchen ticket |

Use a two-word test cardholder name, a future expiry (for example 12/2030 while still future), and a syntactically valid three-digit test CVC. Follow any gateway 3D Secure challenge. There is no locally faked bank challenge or success screen.

1. Start a fresh sandbox test and enter an official test card in the loaded form.
2. Press its pay control. The server creates or reuses the single-use intent for this pending order; the SDK submits directly to Moyasar.
3. Complete any bank step. Moyasar returns to `/lab/moyasar/result` with the payment ID.
4. Only the backend's successful payment fetch and matching checks allow the UI to say “Paid. Verified.”
5. Refresh the result page repeatedly. The kitchen must still contain exactly one ticket.
6. For declines, use “Check this test’s payment status” if the SDK keeps you on the checkout. Once failure is confirmed, start a fresh test. A declined/consumed intent is not reused for a new payment attempt.
7. Never start another payment merely because a result is pending or a network request timed out. Recheck the same order first. “Resume your last test” is a convenience link; the order UUID does not grant access without its original HttpOnly session cookie.

The result page ignores URL `status`, `amount`, `message` and other browser claims. Changing `?status=paid` must not manufacture success. An unrelated callback payment ID, different browser session or modified amount cannot create a kitchen ticket.

## Server verification and duplicates

The backend, not the browser, determines the fixture amount and currency. Apple Pay has its own server-side test amount and a clearly labelled adjustment line; it does not change restaurant pricing.

The server creates the intent using the approved amount, currency, description and callback URL. These fields are fixed by Moyasar. Only its one-payment `client_secret` is returned to the authenticated guest checkout; it is not the account secret key. This credential stays out of URLs and logs. The local SQLite file may contain it, so the directory/file have restrictive permissions and are blocked from Vite's file server.

Each pending order has a server-assigned payment UUID passed as `given_id`, plus lab/order metadata. The backend fetches that exact UUID using the secret test key and checks:

- Matching payment ID, amount, SAR currency, order description and callback URL.
- Matching lab marker and order metadata.
- Expected method and an allowed mada/Visa/Mastercard network.
- No explicit live flag, refund or void; only payment status `paid` qualifies.

`initiated`, `authorized`, fulfilled intents, unknown statuses and failed retrievals never qualify. Account test keys provide environment separation even when the fetch response does not include a `live` field. Raw gateway objects, masked card fields and cardholder names are neither returned to staff nor persisted; only a safe method/network label is retained.

Verification and kitchen insertion use one SQLite transaction. Unique constraints on order/payment IDs and serialised per-order work prevent duplicate kitchen tickets; repeated callbacks preserve Preparing/Ready progress. Kitchen updates use expected prior state, so stale staff actions return a conflict instead of overwriting newer state.

The result screen polls briefly, then offers manual recheck. While the API is running, a 15-second reconciliation loop also checks durable pending intents using the assigned payment IDs, covering a closed/missing browser callback. This is deliberately a minimal demo mechanism, not production webhook delivery. Network failures leave the pending order intact.

## Kitchen screen

Open `/lab/moyasar/kitchen` and enter `MOYASAR_LAB_KITCHEN_KEY` from your local configuration. The key is sent only to the local API, stays in tab memory and is forgotten on refresh/lock. There is no public anonymous order feed.

Verified test tickets appear in **Paid** with their number, fictional items, amount and method/network. Move Paid → Preparing → Ready. The queue refreshes every four seconds, shows its last successful sync, and warns if it may be stale. Only a verified paid order can advance. The database persists across restarts. There is no live kitchen, POS integration, printer, inventory, refund action or customer account.

## Apple Pay: manual setup first

Apple Pay is **not claimed as configured or tested**. The card experiment remains available independently. Setup is based on Moyasar's [Apple Pay integration](https://docs.moyasar.com/guides/apple-pay/basic-integration), [web registration](https://docs.moyasar.com/guides/apple-pay/web-registration) and [sandbox testing](https://docs.moyasar.com/guides/apple-pay/testing) guides.

1. Finish real gateway card testing with your own test account first.
2. Choose a separate HTTPS development hostname. Do not use the production restaurant domain for this experiment. A local HTTPS tunnel can forward that hostname to the existing Vite lab, but **do not expose a tunnel automatically**: decide access restrictions before forwarding this local tool.
3. Set `MOYASAR_LAB_ORIGIN` to that exact HTTPS origin. For a tunnel using the default local port, Vite still listens locally on 5174. Allow only that exact development hostname in Vite `server.allowedHosts` if needed; never use `allowedHosts: true`. Set the tunnel to preserve the external browser Origin header.
4. In Moyasar Dashboard → Settings → Apple Pay Domains, add the exact hostname where checkout starts, including its subdomain.
5. Download the account-specific domain-association file. Put it at `public/.well-known/apple-developer-merchantid-domain-association` without an extension, served as a real file over the chosen HTTPS hostname. This file has **not** been fabricated or included. Check its response is the association text, not the SPA's HTML fallback or a redirect/login page.
6. In Moyasar click Validate, then Register, and confirm success for this hostname. Moyasar's managed web registration does not require your own Apple Developer account; native app setup is different.
7. Set `MOYASAR_LAB_APPLE_PAY_ENABLED=true` and restart. Keep both account keys in test mode. The official form uses Moyasar's merchant validation endpoint; no arbitrary merchant-validation proxy is added to our backend.
8. On a supported Apple device/browser with an available Wallet card, choose the separate Apple Pay test. Capability detection uses `ApplePaySession.canMakePayments`, not user-agent guessing. Domain readiness is a manual assertion in env, not automatic proof of registration. If the browser cannot report capability, card checkout remains the fallback; broader third-party-browser Apple Pay is not promised.

The default Apple Pay amount is **250 SAR / 25000 halalas**, within Moyasar's documented 200–300 SAR sandbox approval range. Other documented ranges can be explored by setting `MOYASAR_LAB_APPLE_PAY_AMOUNT_HALALAS`; always inspect the displayed amount. Moyasar says Apple Pay testing uses a real Wallet card with **test keys**, rather than the card-form test numbers. Have the account/device owner complete that wallet interaction. No real Wallet card was used in our QA.

STC Pay, Google Pay, Samsung Pay and additional methods are outside this experiment.

## Validation and outstanding work

Commands executed during implementation:

```bash
npm run build
npm run typecheck
npm test
MOYASAR_LAB_ENABLED=true VITE_MOYASAR_LAB_ENABLED=true npm run build:lab
```

The normal build, isolated lab build and existing TypeScript command pass. All 35 tests pass. The HTTP integration test needs permission to bind an ephemeral localhost port; its first sandboxed run was blocked by the environment, then it passed with local-port permission. There is no lint script configured. Existing TypeScript coverage remains limited to the original TSX navigation components; lab JavaScript is parsed by the Vite/Node builds and exercised by the focused backend tests.

The new tests use injected gateway fixtures and temporary/in-memory databases. They cover amount/currency/ownership/method tampering, live/secret guards, intent reuse/expiry, non-paid statuses, duplicate callbacks, persistence, kitchen transitions, reconciliation, HTTP origin checks, staff authentication and rejection of card/amount fields. **They do not prove a genuine gateway payment succeeded.**

The owner supplied test credentials locally during QA. They were moved from the config source into the ignored `.env.moyasar-lab.local`, without printing their values; the source contains no credential literals. A separate local kitchen access key was generated there. Desktop/mobile setup-required checkout and kitchen access layouts were reviewed, as well as rejection of a forged browser success flag. The official payment form loads in test mode. End-to-end transaction results are recorded below; native iPhone/Safari and Apple Pay device testing remain outstanding.

The normal production bundle was checked to exclude lab UI/SDK/API strings and lab assets. No production deploy, Git commit, push, merge, payment refund or live financial action was performed.

### Genuine sandbox results — 1 November 2026

These checks used the owner's test key pair and the official gateway UI, not injected responses:

| Scenario | Observed result |
| --- | --- |
| mada approval, 50 SAR | Completed Moyasar's 3DS emulator with successful authentication; callback was fetched/verified by the backend; one paid demo ticket appeared |
| Callback reload | The same ticket number remained; no second ticket was created |
| Kitchen progression | The mada ticket moved Paid → Preparing → Ready |
| mada decline, 50 SAR | Completed authentication, then the issuer test declined; UI reported failure and the kitchen ticket count stayed unchanged |
| Visa approval, 50 SAR | Used official frictionless test card `4111114005765430`; backend verification succeeded and created a separate demo ticket |
| Mastercard approval, 50 SAR | Used the official Mastercard success fixture; completed sandbox 3DS; backend verified the result and created a separate demo ticket |

The local database intentionally retains these demo records for review. Ticket numbers can have gaps because duplicate insert attempts are ignored safely by SQLite's autoincrement/unique constraints. The checkout form was reviewed on desktop/mobile; its submit button follows Meatery's dark styling, and inputs use 16 px text to avoid iPhone focus zoom. Native Safari, physical-device card testing, Apple Pay domain verification and a real Wallet interaction are still untested. No live charge or refund was performed.

## Before considering production

This local SQLite/loopback/staff-key experiment is not suitable for Vercel serverless deployment or live restaurant operations. A production project would separately need a durable hosted database and migration/recovery plan, real staff identity/roles, verified webhooks plus reconciliation, bounded retries and operational monitoring, payment/account onboarding, approved menu/tax/pricing, POS/ZATCA/receipt responsibilities, PDPL/privacy/retention decisions, payment-page PCI assessment, stock/availability rules, table validation, stronger abuse protection and a physical-device/live-payment sign-off plan.

Normal public site builds deliberately exclude the experiment. Keep `.env.moyasar-lab.local`, `.sandbox/` and `dist-lab/` out of version control. Never publish a lab build, remove the test-only guards or rename a live key to make it pass validation.

## Official references checked

- [First payment](https://docs.moyasar.com/getting-started/your-first-payment)
- [Card form integration](https://docs.moyasar.com/guides/card-payments/basic-integration)
- [Form configuration](https://docs.moyasar.com/guides/references/form-configuration)
- [Test cards](https://docs.moyasar.com/guides/card-payments/test-cards)
- [Fetch Payment API](https://docs.moyasar.com/api/payments/02-fetch-payment)
- [Create an intent](https://docs.moyasar.com/guides/payment-intents/create-an-intent)
- [Fulfil an intent with the official form](https://docs.moyasar.com/guides/payment-intents/fulfill-an-intent)
- [Intent lifecycle](https://docs.moyasar.com/guides/payment-intents/intent-lifecycle)
- [Payment idempotency](https://docs.moyasar.com/api/idempotency)
- [Node 22.17 SQLite](https://nodejs.org/download/release/v22.17.0/docs/api/sqlite.html)

Documentation and installed SDK options were inspected on 1 November 2026. Review them again before any later production design.
