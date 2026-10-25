# Kinetic navigation integration

The supplied Sterling Gate navigation has been adapted in `src/components/ui/sterling-gate-kinetic-navigation.tsx`. The reusable UI folder follows the usual `src/components/ui` convention, keeping this larger component separate from restaurant-specific shared components. Its CSS is scoped in `src/components/ui/kinetic-navigation.css`; existing site styling remains in `src/styles.css`, with Arabic homepage rules in `src/pages/home.css`.

The implementation retains GSAP, CustomEase, layered background panels, staggered links, the rolling Menu/Close label, and ambient hover motion. It uses Meatery's actual links, typography, cream/charcoal palette, and flame mark. A native dialog provides focus containment and Escape handling; the close animation finishes before navigation. GSAP settings stay scoped, reduced motion is respected, and cleanup restores scrolling. The animation module is loaded separately from the main bundle so QR menu guests do not download GSAP.

## TypeScript

Vite handles the TSX component. TypeScript and React types are installed, and `tsconfig.json` checks the new UI component without requiring a migration of existing JavaScript pages. Run `npm run typecheck`.

## Optional Tailwind and shadcn setup

The supplied component uses custom classes and does not require Tailwind utilities or shadcn primitives. The steps below document setup for future components that do, as requested by the integration brief. They have not been applied to the existing design.

Install the Vite plugin and add a separate CSS entry containing `@import "tailwindcss";`. Register the plugin in Vite, then import that entry before the site's custom styles. Keep the existing site CSS. See the [official Tailwind Vite guide](https://tailwindcss.com/docs/installation/using-vite).

```bash
npm install tailwindcss @tailwindcss/vite
npm install --save-dev @types/node
```

Example `vite.config.ts` for this existing Vite project:

```ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
```

Add `"paths": { "@/*": ["./src/*"] }` to `tsconfig.json` compiler options. Then initialize shadcn in the existing project and choose `src/components/ui` for UI components and the new Tailwind entry for CSS. Review the resulting base styles against the restaurant design. The [official shadcn Vite instructions](https://ui.shadcn.com/docs/installation/vite#existing-project) document the existing-project flow.

```bash
npx shadcn@latest init
```
