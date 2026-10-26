// Business details shared by the homepage, navigation, menus and metadata.
// Leave unconfirmed details empty; do not substitute an invented address or pin.
export const site = {
  name: "Meatery",
  nameAr: "ميتري",
  // Set the verified HTTPS origin here only after domain ownership is confirmed.
  // Empty means metadata uses the current website origin. Meatery.com is requested,
  // not assumed to be owned, available or connected.
  websiteUrl: "",
  qrMenuPath: "/menu-qr-code",
  // Replace with the client's verified Google Maps place/share link when supplied.
  // Until then, directions open a labelled area search, not an invented map pin.
  googleMapsUrl: "",
  phone: "", // Confirmed public phone number, preferably international format.
  whatsappNumber: "", // International digits only, e.g. 9665…
  instagramUrl: "",
  district: "Al Matal",
  districtAr: "المطل",
  city: "Madinah",
  cityAr: "المدينة المنورة",
  country: "Saudi Arabia",
  countryAr: "المملكة العربية السعودية",
  addressNote: "Al Matal location. Exact address and map pin to be confirmed.",
  addressNoteAr:
    "موقعنا في المطل. سيتم تأكيد العنوان الدقيق ورابط الموقع قريباً.",
  hours: "Coming soon",
  hoursAr: "قريباً",
  hoursNote: "Hours will be shared before opening.",
  hoursNoteAr: "سنعلن ساعات العمل قبل الافتتاح.",
};

export function getLocation(language = "en", business = site) {
  return language === "ar"
    ? `${business.districtAr}، ${business.cityAr}، ${business.countryAr}`
    : `${business.district}, ${business.city}, ${business.country}`;
}

export function getLocationLabel(language = "en", business = site) {
  return `${language === "ar" ? business.nameAr : business.name} — ${getLocation(language, business)}`;
}

export function getDirectionsUrl(business = site) {
  if (business.googleMapsUrl) return business.googleMapsUrl;
  const url = new URL("https://www.google.com/maps/search/");
  url.searchParams.set("api", "1");
  url.searchParams.set(
    "query",
    `${business.name} ${getLocation("en", business)}`,
  );
  return url.href;
}

export function getWebsiteOrigin(currentOrigin = "", business = site) {
  const value = business.websiteUrl || currentOrigin;
  if (!value) return "";
  const url = new URL(value);
  if (!["https:", "http:"].includes(url.protocol)) {
    throw new Error("The website URL must use HTTP or HTTPS.");
  }
  if (
    business.websiteUrl &&
    (url.protocol !== "https:" ||
      url.pathname !== "/" ||
      url.search ||
      url.hash ||
      url.username ||
      url.password)
  ) {
    throw new Error(
      "Set websiteUrl to the verified HTTPS origin, without a path, query or credentials.",
    );
  }
  return url.origin;
}

export function getPageUrl(
  path,
  language = "en",
  currentOrigin = "",
  business = site,
) {
  const origin = getWebsiteOrigin(currentOrigin, business);
  if (!origin) return "";
  const url = new URL(path, origin);
  // Category/search state does not create a separate canonical menu page.
  url.search = language === "ar" ? "?lang=ar" : "";
  url.hash = "";
  return url.href;
}
