import test from "node:test";
import assert from "node:assert/strict";
import { localizedHref, resolveLanguage } from "../src/utils/language.js";
import { homeCopy, navigationCopy } from "../src/data/homeCopy.js";

test("an explicit language link overrides saved and legacy menu preferences", () => {
  assert.equal(resolveLanguage("?lang=ar", "en", "en"), "ar");
  assert.equal(resolveLanguage("?lang=en", "ar", "ar"), "en");
  assert.equal(resolveLanguage("", "ar", "en"), "ar");
  assert.equal(resolveLanguage("?lang=invalid", "invalid", "ar"), "ar");
  assert.equal(resolveLanguage("", undefined, undefined), "en");
});

test("localized links retain category filters and section anchors", () => {
  const result = new URL(
    localizedHref("/menu?category=beef&q=smash#dish", "ar"),
    "https://meatery.local",
  );
  assert.equal(result.pathname, "/menu");
  assert.equal(result.searchParams.get("category"), "beef");
  assert.equal(result.searchParams.get("q"), "smash");
  assert.equal(result.searchParams.get("lang"), "ar");
  assert.equal(result.hash, "#dish");
  assert.equal(localizedHref("/#visit", "ar"), "/?lang=ar#visit");
  assert.equal(
    localizedHref("/menu?lang=ar&category=beef", "en"),
    "/menu?category=beef",
  );
  assert.equal(localizedHref("#story", "ar"), "#story");
});

function checkTranslations(english, arabic, path = "") {
  if (Array.isArray(english)) {
    assert.equal(arabic.length, english.length, path);
    english.forEach((value, index) =>
      checkTranslations(value, arabic[index], `${path}.${index}`),
    );
  } else if (english && typeof english === "object") {
    assert.deepEqual(
      Object.keys(arabic).sort(),
      Object.keys(english).sort(),
      path,
    );
    for (const key of Object.keys(english))
      checkTranslations(english[key], arabic[key], `${path}.${key}`);
  } else {
    assert.equal(typeof arabic, "string", path);
    assert.ok(arabic.trim().length > 0, path);
    // Asset filenames are shared; visible Arabic homepage copy must be localized.
    if (!path.endsWith(".image"))
      assert.match(arabic, /\p{Script=Arabic}/u, path);
  }
}

test("every homepage section has complete Arabic copy and matching photography", () => {
  checkTranslations(homeCopy.en, homeCopy.ar, "home");
  assert.deepEqual(
    homeCopy.ar.featured.dishes.map((dish) => dish.image),
    homeCopy.en.featured.dishes.map((dish) => dish.image),
  );
});

test("both languages cover every navigation and footer label", () => {
  assert.deepEqual(
    Object.keys(navigationCopy.en).sort(),
    Object.keys(navigationCopy.ar).sort(),
  );
  for (const copy of Object.values(navigationCopy))
    for (const value of Object.values(copy)) assert.ok(value.trim().length > 0);
});
