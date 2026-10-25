import React, { useEffect, useMemo, useRef, useState } from "react";
import { menuCategories, menuPricing } from "../data/menu";
import { BrandMark } from "../components/BrandMark";
import { Brand, Footer } from "../components/SiteChrome";
import {
  Arrow,
  CategoriesIcon,
  CloseIcon,
  SearchIcon,
} from "../components/Icons";
import { filterMenu, menuItemCount } from "../utils/menu";
import { MenuItem, DishDetailsDialog } from "../components/MenuDish";
import { useLanguage } from "../context/LanguageContext";
import "./menu.css";

const TOTAL_ITEMS = menuItemCount(menuCategories);

function initialPreferences() {
  const url = new URL(window.location.href);
  const requested = url.searchParams.get("category") || url.hash.slice(1);
  const category = menuCategories.some((entry) => entry.id === requested)
    ? requested
    : "all";
  return {
    category,
    query: url.searchParams.get("q") || "",
  };
}

function LanguageSwitch({ language, onChange }) {
  return (
    <div
      className="qr-language"
      role="group"
      aria-label="Menu language"
      dir="ltr"
    >
      <button
        type="button"
        lang="en"
        aria-label="View menu in English"
        aria-pressed={language === "en"}
        onClick={() => onChange("en")}
      >
        EN
      </button>
      <span aria-hidden="true" />
      <button
        type="button"
        lang="ar"
        aria-label="عرض القائمة بالعربية"
        aria-pressed={language === "ar"}
        onClick={() => onChange("ar")}
      >
        عربي
      </button>
    </div>
  );
}

export default function MenuPage({ tableMode = false }) {
  const [preferences] = useState(initialPreferences);
  const { language, setLanguage, arabic, href } = useLanguage();
  const [categoryId, setCategoryId] = useState(preferences.category);
  const [query, setQuery] = useState(preferences.query);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [optionSelections, setOptionSelections] = useState({});
  const dialogRef = useRef(null);
  const toolbarRef = useRef(null);
  const resultsRef = useRef(null);
  const tabsRef = useRef(null);
  const searchRef = useRef(null);
  const categories = useMemo(
    () => filterMenu(menuCategories, categoryId, query),
    [categoryId, query],
  );
  const count = menuItemCount(categories);
  const missingPrices = categories.some((category) =>
    category.items.some((item) =>
      item.options
        ? item.options.some((option) => option.price == null)
        : item.price == null,
    ),
  );
  const selectedCategory = menuCategories.find(
    (category) => category.id === categoryId,
  );

  useEffect(() => {
    document.title = arabic ? "القائمة — ميتري" : "Menu — Meatery";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        arabic
          ? "اكتشف قائمة ميتري في المدينة المنورة، من البرجر إلى الأطباق الخاصة والحلويات."
          : "Explore the Meatery menu in Madinah: burgers, tacos, sides, sweets and grill specials.",
      );
  }, [language, arabic]);

  useEffect(() => {
    const url = new URL(window.location.href);
    for (const [key, value] of [
      ["lang", language === "ar" ? "ar" : ""],
      ["category", categoryId === "all" ? "" : categoryId],
      ["q", query.trim()],
    ]) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    url.hash = "";
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }, [language, categoryId, query]);

  useEffect(() => {
    document.body.classList.toggle(
      "menu-overlay-open",
      directoryOpen || Boolean(selectedEntry),
    );
    return () => document.body.classList.remove("menu-overlay-open");
  }, [directoryOpen, selectedEntry]);

  useEffect(() => {
    const active = tabsRef.current?.querySelector('[aria-pressed="true"]');
    if (!active?.getClientRects().length) return;
    active.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "instant",
    });
  }, [categoryId, language]);

  function bringResultsIntoView() {
    requestAnimationFrame(() => {
      const toolbar = toolbarRef.current;
      const results = resultsRef.current;
      if (toolbar && results && toolbar.getBoundingClientRect().top <= 1) {
        window.scrollTo({
          top: Math.max(
            0,
            results.getBoundingClientRect().top +
              window.scrollY -
              toolbar.offsetHeight -
              18,
          ),
          behavior: "instant",
        });
      }
    });
  }

  function selectCategory(id) {
    setCategoryId(id);
    setQuery("");
    dialogRef.current?.close();
    bringResultsIntoView();
  }

  function searchMenu(value) {
    setQuery(value);
    setCategoryId("all");
    bringResultsIntoView();
  }

  function openDirectory() {
    dialogRef.current?.showModal();
    setDirectoryOpen(true);
  }

  const categoryChoices = [
    { id: "all", en: "All", ar: "الكل", count: TOTAL_ITEMS },
    ...menuCategories.map((category) => ({
      ...category,
      count: category.items.length,
    })),
  ];

  return (
    <div
      className={`qr-menu-page ${tableMode ? "qr-menu-page--table" : ""} ${arabic ? "qr-menu-page--arabic" : ""}`}
    >
      <a className="qr-skip-link" href="#menu-results">
        {arabic ? "انتقل إلى الأصناف" : "Skip to dishes"}
      </a>
      <header className="qr-menu-header" dir="ltr">
        <div className="qr-shell qr-menu-topbar">
          <Brand />
          <a className="qr-home-link" href={href("/")}>
            {arabic ? "الرئيسية" : "THE RESTAURANT"}
            <Arrow diagonal />
          </a>
        </div>
      </header>

      <main>
        <section className="qr-menu-intro" aria-labelledby="menu-title">
          {!tableMode && (
            <img
              className="qr-menu-intro-image"
              src="/images/menu-burger.jpg"
              alt=""
              fetchPriority="high"
            />
          )}
          <div className="qr-shell qr-menu-intro-inner">
            <div>
              <span className="qr-eyebrow">
                {arabic ? "ميتري · المدينة المنورة" : "MEATERY · MADINAH"}
              </span>
              <h1 id="menu-title">
                {arabic ? "القائمة" : "THE MENU"}
                <span>.</span>
              </h1>
            </div>
            <p>
              {arabic ? (
                "نكهات جريئة. وصحبة حلوة."
              ) : (
                <>
                  Bold flavours.
                  <br />
                  Good company.
                </>
              )}
            </p>
          </div>
        </section>

        <div className="qr-menu-controls" ref={toolbarRef}>
          <div className="qr-shell">
            <div className="qr-menu-tools">
              <div className="qr-search">
                <SearchIcon />
                <label className="qr-sr-only" htmlFor="menu-search">
                  {arabic
                    ? "ابحث في القائمة بالعربية أو الإنجليزية"
                    : "Search the menu in English or Arabic"}
                </label>
                <input
                  id="menu-search"
                  ref={searchRef}
                  type="search"
                  value={query}
                  placeholder={
                    arabic ? "ما الذي تشتهيه؟" : "What are you craving?"
                  }
                  onChange={(event) => searchMenu(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") searchMenu("");
                  }}
                  enterKeyHint="search"
                  autoComplete="off"
                  spellCheck={false}
                />
                {query && (
                  <button
                    type="button"
                    className="qr-icon-button"
                    aria-label={arabic ? "مسح البحث" : "Clear search"}
                    onClick={() => {
                      searchMenu("");
                      searchRef.current?.focus({ preventScroll: true });
                    }}
                  >
                    <CloseIcon />
                  </button>
                )}
              </div>
              <LanguageSwitch language={language} onChange={setLanguage} />
            </div>
            <div className="qr-category-bar">
              <nav
                className="qr-category-tabs"
                aria-label={arabic ? "أقسام القائمة" : "Menu categories"}
                ref={tabsRef}
              >
                {categoryChoices.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    aria-pressed={categoryId === category.id}
                    onClick={() => selectCategory(category.id)}
                  >
                    {arabic ? category.ar : category.en}
                    <span>{category.count}</span>
                  </button>
                ))}
              </nav>
              <button
                className="qr-directory-button qr-icon-button"
                type="button"
                aria-label={
                  arabic ? "عرض جميع الأقسام" : "Browse all categories"
                }
                aria-haspopup="dialog"
                aria-expanded={directoryOpen}
                onClick={openDirectory}
              >
                <CategoriesIcon />
              </button>
            </div>
          </div>
        </div>

        <div className="qr-shell qr-menu-layout">
          <aside className="qr-menu-sidebar">
            <span className="qr-eyebrow">
              {arabic ? "على القائمة" : "ON THE MENU"}
            </span>
            <nav aria-label={arabic ? "دليل الأقسام" : "Category directory"}>
              {categoryChoices.map((category, index) => (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={categoryId === category.id}
                  onClick={() => selectCategory(category.id)}
                >
                  <span>{String(index).padStart(2, "0")}</span>
                  {arabic ? category.ar : category.en}
                </button>
              ))}
            </nav>
            <p>
              {arabic ? (
                "خذ وقتك. اختر ما تحبّ."
              ) : (
                <>
                  Take your time.
                  <br />
                  Find your favourite.
                </>
              )}
            </p>
          </aside>

          <div className="qr-menu-results" id="menu-results" ref={resultsRef}>
            <div className="qr-menu-summary">
              <span role="status" aria-live="polite" aria-atomic="true">
                {arabic
                  ? `${count} صنف`
                  : `${count} ${count === 1 ? "item" : "items"}`}
                <span className="qr-summary-separator" aria-hidden="true" />
                {query.trim()
                  ? arabic
                    ? "نتائج البحث"
                    : "Search results"
                  : selectedCategory
                    ? arabic
                      ? selectedCategory.ar
                      : selectedCategory.en
                    : arabic
                      ? "القائمة الكاملة"
                      : "The full selection"}
              </span>
              {(query || categoryId !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    searchMenu("");
                  }}
                >
                  {arabic ? "عرض الكل" : "View all"}
                  <Arrow />
                </button>
              )}
            </div>
            {count > 0 && (menuPricing.estimated || missingPrices) && (
              <p className="qr-prices-note">
                {menuPricing.estimated
                  ? arabic
                    ? "أسعار تقديرية للمعاينة. الأسعار النهائية بانتظار اعتماد المطعم."
                    : "Estimated preview prices. Final prices await restaurant approval."
                  : arabic
                    ? "يرجى الاستفسار من فريقنا عن الأسعار."
                    : "Please ask our team for prices."}
              </p>
            )}

            {categories.length ? (
              categories.map((category) => (
                <section
                  className="qr-menu-section"
                  key={category.id}
                  aria-labelledby={`heading-${category.id}`}
                >
                  <div className="qr-menu-section-heading">
                    <span className="qr-eyebrow">
                      {String(
                        menuCategories.findIndex(
                          (entry) => entry.id === category.id,
                        ) + 1,
                      ).padStart(2, "0")}{" "}
                      / {arabic ? "ميتري" : "MEATERY"}
                    </span>
                    <h2 id={`heading-${category.id}`}>
                      {arabic ? category.ar : category.en}
                      <span>.</span>
                    </h2>
                    <p
                      className={
                        category.availability === "limited"
                          ? "qr-availability-note"
                          : ""
                      }
                    >
                      {category.availability === "limited" && <BrandMark />}
                      {arabic ? category.descriptionAr : category.descriptionEn}
                    </p>
                  </div>
                  <div className="qr-menu-dishes">
                    {category.items.map((item) => (
                      <MenuItem
                        item={item}
                        language={language}
                        key={item.id}
                        selectedOptionId={optionSelections[item.id]}
                        onOpen={() => setSelectedEntry({ item, category })}
                      />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="qr-menu-empty">
                <SearchIcon />
                <h2>
                  {arabic ? "لم نجد هذا الصنف." : "No matches this time."}
                </h2>
                <p>
                  {arabic
                    ? "جرّب اسماً آخر بالعربية أو الإنجليزية."
                    : "Try another dish name in English or Arabic."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    searchMenu("");
                    searchRef.current?.focus({ preventScroll: true });
                  }}
                >
                  {arabic ? "تصفّح القائمة كاملة" : "Explore the full menu"}
                  <Arrow />
                </button>
              </div>
            )}

            <div className="qr-menu-closing">
              <BrandMark className="qr-closing-mark" />
              <p>
                {arabic
                  ? "على الطاولة، تحلو الصحبة."
                  : "Better around the table."}
              </p>
              <span>
                {arabic
                  ? "للاستفسار عن المكوّنات أو الحساسية الغذائية، تحدث إلى فريقنا."
                  : "For ingredients or food allergies, please speak to our team."}
              </span>
              <a href={href("/")}>
                {arabic ? "اكتشف ميتري" : "A LITTLE MORE MEATERY"}
                <Arrow diagonal />
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer compact={tableMode} />
      <DishDetailsDialog
        entry={selectedEntry}
        language={language}
        selectedOptionId={
          selectedEntry ? optionSelections[selectedEntry.item.id] : undefined
        }
        onOptionChange={(optionId) =>
          setOptionSelections((current) => ({
            ...current,
            [selectedEntry.item.id]: optionId,
          }))
        }
        onClose={() => setSelectedEntry(null)}
      />

      <dialog
        className="qr-category-dialog"
        ref={dialogRef}
        aria-labelledby="category-dialog-title"
        onClose={() => setDirectoryOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
      >
        <div className="qr-category-dialog-heading">
          <div>
            <span className="qr-eyebrow">
              {arabic ? "القائمة" : "THE MENU"}
            </span>
            <h2 id="category-dialog-title">
              {arabic ? "اختر ما تشتهي." : "Find your favourite."}
            </h2>
          </div>
          <button
            className="qr-icon-button"
            type="button"
            autoFocus
            aria-label={arabic ? "إغلاق الأقسام" : "Close categories"}
            onClick={() => dialogRef.current?.close()}
          >
            <CloseIcon />
          </button>
        </div>
        <div className="qr-directory-list">
          {categoryChoices.map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={categoryId === category.id}
              onClick={() => selectCategory(category.id)}
            >
              <span>{arabic ? category.ar : category.en}</span>
              <span>{category.count}</span>
              <Arrow />
            </button>
          ))}
        </div>
      </dialog>
    </div>
  );
}
