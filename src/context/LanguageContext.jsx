import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  LANGUAGE_KEY,
  LEGACY_LANGUAGE_KEY,
  localizedHref,
  resolveLanguage,
} from "../utils/language";

const LanguageContext = createContext(null);
function initialLanguage() {
  try {
    return resolveLanguage(
      window.location.search,
      localStorage.getItem(LANGUAGE_KEY),
      localStorage.getItem(LEGACY_LANGUAGE_KEY),
    );
  } catch {
    return resolveLanguage(window.location.search);
  }
}
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(initialLanguage);
  useLayoutEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch {
      /* Private browsing can disable storage. */
    }
    const url = new URL(window.location.href);
    if (language === "ar") url.searchParams.set("lang", "ar");
    else url.searchParams.delete("lang");
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [language]);
  const value = useMemo(
    () => ({
      language,
      setLanguage,
      arabic: language === "ar",
      href: (path) => localizedHref(path, language),
    }),
    [language],
  );
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
