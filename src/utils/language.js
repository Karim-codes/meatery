export const LANGUAGE_KEY = "meatery-language";
export const LEGACY_LANGUAGE_KEY = "meatery-menu-language";

export function resolveLanguage(search, savedLanguage, legacyLanguage) {
  const requested = new URLSearchParams(search).get("lang");
  return (
    [requested, savedLanguage, legacyLanguage].find(
      (value) => value === "en" || value === "ar",
    ) || "en"
  );
}

export function localizedHref(href, language) {
  if (href.startsWith("#")) return href;
  const url = new URL(href, "https://meatery.local");
  if (language === "ar") url.searchParams.set("lang", "ar");
  else url.searchParams.delete("lang");
  return `${url.pathname}${url.search}${url.hash}`;
}
