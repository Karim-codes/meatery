export function normalizeMenuText(value = "") {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ـ/g, "")
    .toLowerCase()
    .trim();
}

export function filterMenu(categories, categoryId = "all", query = "") {
  const terms = normalizeMenuText(query).split(/\s+/).filter(Boolean);
  return categories
    .filter((category) => categoryId === "all" || category.id === categoryId)
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => {
        const text = normalizeMenuText(
          [
            category.en,
            category.ar,
            item.en,
            item.ar,
            item.detailEn,
            item.detailAr,
          ]
            .filter(Boolean)
            .join(" "),
        );
        return terms.every((term) => text.includes(term));
      }),
    }))
    .filter((category) => category.items.length > 0);
}

export function menuItemCount(categories) {
  return categories.reduce(
    (total, category) => total + category.items.length,
    0,
  );
}

export function formatMenuPrice(price, language = "en") {
  if (price == null) return null;
  return new Intl.NumberFormat(language === "ar" ? "ar-SA" : "en-SA", {
    style: "currency",
    currency: "SAR",
    currencyDisplay: "code",
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatMenuAmount(price, language = "en") {
  if (price == null) return null;
  return new Intl.NumberFormat(language === "ar" ? "ar-SA" : "en-SA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function menuItemPrice(item, optionId) {
  if (!item.options?.length) return item.price;
  return (
    item.options.find((option) => option.id === optionId) || item.options[0]
  ).price;
}
