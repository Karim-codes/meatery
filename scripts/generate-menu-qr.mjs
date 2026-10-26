import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import QRCode from "qrcode";
import { getWebsiteOrigin, site } from "../src/data/site.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const urlArgument = process.argv.indexOf("--url");
const target = process.argv[urlArgument + 1];
if (urlArgument !== -1 && (!target || target.startsWith("--"))) {
  throw new Error("Provide a public menu URL after --url.");
}
// A printed code must always encode an explicit, public address. Until a domain
// is verified, preserve the last approved destination instead of guessing one.
const websiteOrigin = getWebsiteOrigin();
const approvedDestination =
  urlArgument !== -1
    ? target
    : websiteOrigin
      ? new URL(site.qrMenuPath, websiteOrigin).href
      : (
          await readFile(path.join(root, "public/qr/destination.txt"), "utf8")
        ).trim();
const url = new URL(approvedDestination);
if (url.protocol !== "https:")
  throw new Error("The printed QR code must use an HTTPS URL.");
const escapeXml = (text) =>
  text.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character],
  );
const output = path.join(root, "public/qr");
await mkdir(output, { recursive: true });
const options = {
  errorCorrectionLevel: "M",
  margin: 4,
  color: { dark: "#10100f", light: "#ffffff" },
};
const qrSvg = await QRCode.toString(url.href, { ...options, type: "svg" });
await writeFile(path.join(output, "meatery-menu.svg"), qrSvg);
await QRCode.toFile(path.join(output, "meatery-menu.png"), url.href, {
  ...options,
  width: 1600,
});
const qrViewBox = qrSvg.match(/viewBox="([^"]+)"/)[1];
const qrPaths = qrSvg
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "");
const mark = (await readFile(path.join(root, "public/brand-mark.svg"), "utf8"))
  .replace(/<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "");
const card = `<svg xmlns="http://www.w3.org/2000/svg" width="105mm" height="148mm" viewBox="0 0 420 592" role="img" aria-labelledby="title description">
<title id="title">Meatery table menu QR code</title>
<desc id="description">Scan to open ${escapeXml(url.href)}. A6 portrait artwork.</desc>
<rect width="420" height="592" fill="#f3f1eb"/>
<rect x="14" y="14" width="392" height="564" fill="none" stroke="#c8bba7" stroke-width=".7"/>
<g fill="#181817"><svg x="192" y="30" width="36" height="52" viewBox="0 0 160 230">${mark}</svg></g>
<text x="210" y="122" text-anchor="middle" fill="#181817" font-family="Impact, 'Arial Narrow', sans-serif" font-size="36" font-weight="700" letter-spacing="1">MEATERY.</text>
<path d="M76 146h268" stroke="#c8bba7" stroke-width=".7"/>
<text x="210" y="174" text-anchor="middle" fill="#736758" font-family="Arial, sans-serif" font-size="9" letter-spacing="2">GOOD FOOD. GOOD COMPANY.</text>
<text x="210" y="229" text-anchor="middle" fill="#181817" font-family="Impact, 'Arial Narrow', sans-serif" font-size="49" font-weight="700">THE MENU.</text>
<text x="210" y="257" text-anchor="middle" fill="#736758" font-family="'Noto Sans Arabic', Arial, sans-serif" font-size="18" lang="ar" direction="rtl">قائمة الطعام</text>
<svg x="90" y="276" width="240" height="240" viewBox="${qrViewBox}" shape-rendering="crispEdges">${qrPaths}</svg>
<text x="210" y="542" text-anchor="middle" fill="#181817" font-family="Arial, sans-serif" font-size="10" letter-spacing="1.4">SCAN. EXPLORE. ENJOY.</text>
<text x="210" y="563" text-anchor="middle" fill="#736758" font-family="Arial, sans-serif" font-size="8.5">${escapeXml(url.host + url.pathname)}</text>
</svg>`;
await writeFile(path.join(output, "meatery-table-card.svg"), card);
await writeFile(path.join(output, "destination.txt"), `${url.href}\n`);
console.log(`Menu QR assets generated for ${url.href}`);
console.log(
  "public/qr/meatery-menu.svg · meatery-menu.png · meatery-table-card.svg",
);
