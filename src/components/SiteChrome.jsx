import React, { lazy, Suspense, useEffect, useState } from "react";
import { Arrow } from "./Icons";
import { Brand } from "./Brand";
import { NavigationToggle } from "./NavigationToggle";
import { useLanguage } from "../context/LanguageContext";
import { navigationCopy } from "../data/homeCopy";
import { site } from "../data/site";
import "./ui/kinetic-navigation.css";
export { Brand } from "./Brand";

let navigationModule;
function loadNavigation() {
  navigationModule ||= import("./ui/sterling-gate-kinetic-navigation");
  return navigationModule;
}
const KineticNavigation = lazy(loadNavigation);

export function Header() {
  const { language, setLanguage, arabic, href } = useLanguage();
  const copy = navigationCopy[language];
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const links = [
    { label: copy.home, href: href("/") },
    { label: copy.menu, href: href("/menu") },
    { label: copy.story, href: href("/#story") },
    { label: copy.visit, href: href("/#visit") },
    { label: copy.contact, href: href("/#contact") },
  ];
  useEffect(() => {
    if (!window.matchMedia("(max-width: 1000px)").matches) return;
    const timer = window.setTimeout(() => {
      void loadNavigation();
    }, 1400);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1001px)");
    const handleChange = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", handleChange);
    return () => desktop.removeEventListener("change", handleChange);
  }, []);
  return (
    <>
      <header className={`site-header ${arabic ? "site-header--arabic" : ""}`}>
        <div className="header-inner">
          <Brand />
          <nav className="main-nav" aria-label={copy.navLabel}>
            {links.slice(0, 4).map((link) => (
              <a href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="header-language"
              type="button"
              onClick={() => setLanguage(arabic ? "en" : "ar")}
              aria-label={copy.switchLabel}
              lang={arabic ? "en" : "ar"}
            >
              {copy.switchLanguage}
              <Arrow diagonal />
            </button>
            <a className="header-menu-link" href={href("/menu")}>
              {copy.explore}
              <Arrow diagonal />
            </a>
            <NavigationToggle
              open={open}
              language={language}
              onClick={() => {
                setRequested(true);
                setOpen((value) => !value);
              }}
            />
          </div>
        </div>
      </header>
      {requested && (
        <Suspense fallback={null}>
          <KineticNavigation
            open={open}
            onClose={() => setOpen(false)}
            language={language}
            onLanguageChange={setLanguage}
            links={links}
          />
        </Suspense>
      )}
    </>
  );
}

export function Footer({ compact = false }) {
  const { language, arabic, href } = useLanguage();
  const copy = navigationCopy[language];
  const year = new Intl.NumberFormat(arabic ? "ar-SA" : "en", {
    useGrouping: false,
  }).format(new Date().getFullYear());
  return (
    <footer
      className={`footer ${compact ? "footer--compact" : ""} ${arabic ? "footer--arabic" : ""}`}
      id="footer"
      dir={arabic ? "rtl" : "ltr"}
    >
      <div className="footer-top">
        <Brand large={!compact} />
        <span>
          {copy.footerTag}
          <br />
          {copy.location}
        </span>
      </div>
      <div className="footer-bottom">
        <span>
          {copy.copyright} {year} {arabic ? "ميتري" : "MEATERY"}
        </span>
        <nav aria-label={arabic ? "روابط أسفل الصفحة" : "Footer navigation"}>
          <a href={href("/")}>{copy.home}</a>
          <a href={href(compact ? site.qrMenuPath : "/menu")}>{copy.menu}</a>
          <a href={href("/#visit")}>{copy.visit}</a>
        </nav>
        <span>{copy.footerNote}</span>
      </div>
      <div className="footer-credit">
        {copy.credit}
        <a
          href="https://coderaxa.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={copy.creditLabel}
          lang="en"
          dir="ltr"
        >
          CodeRaxa
        </a>
      </div>
    </footer>
  );
}
