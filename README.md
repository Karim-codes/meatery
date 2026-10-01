# Meatery website preview

React + Vite concept for Meatery in Madinah, prepared for Vercel. The project has two routes: `/` and `/menu`.

## Run locally

```bash
npm install
npm run dev
```

Run `npm run build` to create the production bundle. `vercel.json` rewrites direct `/menu` requests to the Vite app.

## Update before launch

- The secondary M + flame symbol was recreated as a transparent vector from the supplied logo reference (`public/brand-mark.svg`). Header and footer pair it with the Meatery wordmark. SVG/PNG favicon and Apple touch icon assets use the same symbol.
- Replace the sample dishes, English and Arabic text, and `price: null` values in `src/data/menu.js` with the approved menu. Numeric prices render as `SAR`.
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
