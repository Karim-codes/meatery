import test from "node:test";
import assert from "node:assert/strict";
import {
  getDirectionsUrl,
  getLocation,
  getLocationLabel,
  getPageUrl,
  getWebsiteOrigin,
  site,
} from "../src/data/site.js";

const pendingBusiness = { ...site, websiteUrl: "", googleMapsUrl: "" };

test("location labels include the restaurant and confirmed area in both languages", () => {
  assert.equal(getLocationLabel(), "Meatery — Al Matal, Madinah, Saudi Arabia");
  assert.equal(
    getLocation("ar"),
    "المطل، المدينة المنورة، المملكة العربية السعودية",
  );
});

test("directions use the confirmed area search until a verified place link is supplied", () => {
  const url = new URL(getDirectionsUrl(pendingBusiness));
  assert.equal(url.origin, "https://www.google.com");
  assert.equal(url.pathname, "/maps/search/");
  assert.equal(
    url.searchParams.get("query"),
    "Meatery Al Matal, Madinah, Saudi Arabia",
  );
  const googleMapsUrl = "https://maps.app.goo.gl/confirmed-client-pin";
  assert.equal(getDirectionsUrl({ ...site, googleMapsUrl }), googleMapsUrl);
});

test("unconfigured domains use the current origin without assuming domain ownership", () => {
  assert.equal(getWebsiteOrigin("", pendingBusiness), "");
  assert.equal(
    getWebsiteOrigin("https://preview.example", pendingBusiness),
    "https://preview.example",
  );
  assert.equal(
    getPageUrl("/menu", "ar", "http://localhost:5173", pendingBusiness),
    "http://localhost:5173/menu?lang=ar",
  );
});

test("one confirmed origin updates homepage and both menu metadata URLs", () => {
  const production = { ...site, websiteUrl: "https://restaurant.example/" };
  for (const path of ["/", "/menu", site.qrMenuPath]) {
    assert.equal(
      getPageUrl(path, "en", "https://preview.example", production),
      `https://restaurant.example${path}`,
    );
    assert.equal(
      getPageUrl(path, "ar", "https://preview.example", production),
      `https://restaurant.example${path}?lang=ar`,
    );
  }
  assert.equal(
    getPageUrl(
      "/menu?q=burger&category=beef#dish",
      "en",
      "https://preview.example",
      production,
    ),
    "https://restaurant.example/menu",
  );
});

test("production website settings reject insecure or malformed canonical origins", () => {
  for (const websiteUrl of [
    "http://restaurant.example",
    "https://restaurant.example/menu",
    "https://restaurant.example/?q=1",
    "https://user:password@restaurant.example",
    "javascript:alert(1)",
  ]) {
    assert.throws(() => getWebsiteOrigin("", { ...site, websiteUrl }));
  }
});
