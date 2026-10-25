# Meatery website preview

React + Vite website for Meatery in Madinah, prepared for Vercel.

- `/` — the restaurant homepage.
- `/menu` — the full branded menu.
- `/menu-qr-code` — a compact, image-free table menu that opens directly from a QR scan.

Both menu routes share the same 42 dishes in `src/data/menu.js`. English and Arabic search, category filters, patty options, prices, and availability notices use the same components. The chosen language is remembered locally, and menu filters can be shared through the URL.

The homepage, navigation, footer, and contact notices now support both languages, including right-to-left layout. Use `/?lang=ar` for an Arabic link or the header language control. One shared preference follows guests between the homepage and menu pages, including their existing saved menu preference. Homepage translations live in `src/data/homeCopy.js`; confirmed venue details have English/Arabic fields in `src/data/site.js`. Have Meatery review the Arabic wording alongside the menu names before launch.

Small screens use the supplied kinetic navigation adapted to Meatery, with layered GSAP transitions, staggered links, a rolling Menu/Close control, keyboard dismissal, focus restoration, and reduced-motion support. Its JavaScript loads separately and is not requested by the QR menu. The component lives in `src/components/ui/sterling-gate-kinetic-navigation.tsx`; `npm run typecheck` checks it. See [the integration notes](docs/COMPONENT_INTEGRATION.md) for the component structure and optional Tailwind/shadcn setup instructions.

Desktop shows the category sidebar; mobile shows the horizontal category bar and picker. Each dish opens a keyboard-accessible detail dialog. On phones it is a centred card with surrounding space and an internal scroll area, with the close control always available. The dialog shows its category, approved description, estimated riyal price, available options, and ingredient guidance. Patty/side selections are remembered during browsing and remain consistent when reopening a dish.

All 42 dishes now have user-requested **illustrative price estimates**, including separate double/triple/quadruple burger prices. They are visibly labelled as estimates in both languages. Replace the numeric prices in `src/data/menu.js` with the client's approved prices, then set `menuPricing.estimated` to `false`. The Saudi riyal symbol is SVG, with localized digits and a readable currency label for assistive technology. See [pricing and asset notes](docs/PRICING_AND_ASSETS.md).

For approved dish photography, add `image` (a local asset path), `imageAltEn`, and `imageAltAr` to the dish. The modal uses the Meatery mark until a photo is supplied. Add verified ingredient lists with `ingredientsEn` and `ingredientsAr` arrays; the default simply directs guests to the team. No ingredient lists or photos are invented for the individual dishes.

## Run locally

```bash
npm install
npm run dev
```

Run `npm run build` to create the production bundle and `npm test` for menu data/search checks. `vercel.json` supports direct requests to all three routes.

## Table QR code

The approved destination is **https://meatery-j99p.vercel.app/menu-qr-code**. No QR subscription, external redirect service, app install, or login is involved.

Generated files in `public/qr/`:

- `meatery-menu.svg` — scalable QR code with its four-module white quiet zone.
- `meatery-menu.png` — 1600 × 1600 PNG for table signage.
- `meatery-table-card.svg` — self-contained A6 portrait artwork (105 × 148 mm) with the Meatery mark and a large QR code.
- `destination.txt` — the exact encoded address.

Run `npm run qr:generate` after changing `qrMenuUrl` in `src/data/site.js`, or generate for a new approved URL with:

```bash
npm run qr:generate -- --url https://example.com/menu-qr-code
```

Keep the white quiet zone intact, print the code at least 35 mm square, and scan a physical print on a phone before producing the table signs. The A6 card uses a 60 mm code, including its quiet zone. The printed URL remains the same when dishes and prices change.

Confirm the latest deployment serves `/menu-qr-code` before putting QR cards on tables.

## Update before launch

- The secondary M + flame symbol was recreated as a transparent vector from the supplied logo reference (`public/brand-mark.svg`). Header and footer pair it with the Meatery wordmark. SVG/PNG favicon and Apple touch icon assets use the same symbol.
- The client’s supplied dish names are included. Replace the clearly marked estimated prices with confirmed `price` values, including each option's price, then turn off `menuPricing.estimated`. Null values remain supported and direct guests to the team. Review Arabic wording with the client and add approved descriptions as `detailEn` / `detailAr`.
- Fish & Chips, Brisket, Ribs, and Steak on Mash / Chips are grouped under Specials and explicitly marked subject to availability. There are no invented ingredient lists or allergen claims.
- Add the confirmed map pin, opening hours, WhatsApp number, and Instagram account in `src/data/site.js`. The map panel is illustrative; the WhatsApp button currently explains that the number is still missing.
- Replace generated concept photography with approved photography if the client has it. Current images are in `public/images/`.

## Image generation

Images were generated with the built-in image generation tool for this concept and converted to JPEG for delivery. Prompt set:

1. Wide, low-key editorial ribeye photograph with dark left-side negative space for the homepage hero.
2. Portrait photograph of beef over a working charcoal grill with a chef's hand and subtle smoke.
3. Overhead plated sliced steak with roasted garlic and sauce on a dark table.
4. Contemporary dark grill restaurant interior with warm lighting and no visible people.
5. Premium double beef burger on a dark plate, photographed in a dramatic portrait crop.
6. Fire-grilled lamb chops with herbs and charred lemon on a dark stone table.

All prompts asked for realistic premium food or hospitality photography, with no text, logos, or watermarks.
