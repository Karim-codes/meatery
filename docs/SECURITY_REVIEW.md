# Hosting and local-secret security review

Reviewed 13 November 2026. Scope: the static restaurant website on `main`, Cloudflare hosting preparation, local experiment files and the histories of the published website/experiment branches. The payment experiment remains separate. This is a repository and local-runtime review, not a production payment certification or an audit of hosting-account access controls.

## Findings and changes

| Finding | Result |
| --- | --- |
| `main` lacked the experiment branch's secret/data ignore rules. Switching branches left the local env, database and lab bundle untracked and vulnerable to accidental staging. | Fixed in `.gitignore`. Env files, local Cloudflare variables/state, SQLite data, lab bundles and private certificate material are excluded. The empty experiment env template is the intentional exception. Additional local exclusions in `.git/info/exclude` protect this checkout across branch switches. |
| Payment files left on disk could be requested from the website's development server. | `vite.config.mjs` denies env files, private key material, Git/Cloudflare state, the local database, backend experiment source and generated lab output. Actual env/database/lab requests, including absolute-file requests, returned HTTP 403. |
| The credential screenshot exposed the sandbox secret and kitchen key. | The local kitchen key was replaced without logging it. Lab and Apple Pay flags are disabled in the ignored env file. The user chose to defer Moyasar test-secret rotation until before resuming the lab. **That rotation remains required**; changing local files or Git ignore rules does not revoke the exposed gateway secret. No live key was present in the local configuration reviewed. |
| Local tool checkpoint refs contained earlier copies of credential files. | These were identified separately from the published branches. They are not evidence that credentials reached GitHub. The local refs were left intact; they reinforce the need to rotate the exposed secret. Never use `git push --mirror` or publish local tool/checkpoint refs. |
| Cloudflare routing configuration was only in a temporary audit snapshot. | `wrangler.jsonc` now belongs at the repository root. It contains public hosting settings, points only to `dist/`, and has no secret bindings, backend entry point or payment configuration. It should be committed, not ignored. The temporary copy was used to verify `main` independently before changing the working branch. |
| Cloudflare static responses lacked project-defined security headers. | `public/_headers` adds MIME sniffing protection, frame restrictions, a limited base/object/frame policy, a cross-origin referrer policy and restrictions on unused camera/microphone/geolocation features. The referrer policy preserves the origin required by the existing map tile service. This is a baseline policy, not a claim of comprehensive XSS protection. |

## Verification

- Scanned 111 Git blobs reachable from local and remote-tracking `main` and `experiment/moyasar-payments` histories: no matches for the configured credentials, and no private local env, database or lab-output paths in those histories.
- Reviewed public React source for unsafe HTML insertion, execution of strings, query handling, browser storage and external links. No raw HTML/eval sink was found; the website keeps its language preference and menu browsing state locally, with no production account or payment credentials.
- `npm audit --json`: zero reported vulnerabilities across the locked dependency tree at review time. This does not establish absence of unknown vulnerabilities.
- All 22 website tests, the production build and `npm run typecheck` passed.
- The new production output contained no configured credentials, payment lab bundle, local env file or SQLite database.
- Actual Vite HTTP requests for the local env, database and lab output returned 403, including direct `/@fs` requests for private files.
- Cloudflare's local runtime served the correct app shell and all configured security headers for `/`, `/menu`, `/menu-qr-code` and their Arabic URL variants. The SVG favicon also served correctly with the expected header.
- `wrangler.jsonc` was validated with the cached Wrangler 4.147.0 runtime using compatibility date `2026-10-08`. The website's visual assets, styles and JavaScript bundles were unchanged by this hosting work.

## Deployment and resuming the lab

Commit `.gitignore`, `wrangler.jsonc`, `vite.config.mjs`, `public/_headers` and these instructions. Keep actual credentials, local state and generated bundles out of Git. Seeing an ignored file in the editor is normal: ignoring prevents ordinary Git staging, not local file access. A publishable gateway key is designed to reach its configured checkout; a secret key and kitchen key are not.

Cloudflare should build `main` with `npm run build` and deploy with `npx wrangler deploy`. No payment keys or lab flags are needed. The new `_headers` file targets Cloudflare; it does not replace Vercel-specific configuration. The existing printed QR cards still use the approved Vercel URL and need that destination to remain available during a hosting migration.

Before resuming the experiment, regenerate the exposed **test secret** in Moyasar, revoke the previous secret, update `MOYASAR_SECRET_KEY` locally and explicitly re-enable the lab flags on `experiment/moyasar-payments`. Restarting the local lab is necessary for it to pick up the rotated kitchen key and configuration. Never paste or screenshot the new credentials.

No Git history rewrite, Cloudflare deployment, payment transaction, live-secret operation or production ordering launch was performed during this review. Physical iPhone/Safari testing and live Cloudflare response checks were outside this local hosting review.

References: [Moyasar API keys and regeneration](https://docs.moyasar.com/guides/dashboard/get-your-api-keys), [Vite environment variable exposure](https://vite.dev/guide/env-and-mode), [Cloudflare configuration](https://developers.cloudflare.com/workers/wrangler/configuration/), [Cloudflare static response headers](https://developers.cloudflare.com/workers/static-assets/headers/).
