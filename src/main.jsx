import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { menuCategories } from "./data/menu";
import { site } from "./data/site";
import "./styles.css";

const ASSET = "/images/";
const whatsappUrl = site.whatsappNumber
  ? `https://wa.me/${site.whatsappNumber}`
  : "";

function Arrow({ diagonal = false }) {
  return (
    <span className="arrow" aria-hidden="true">
      {diagonal ? "↗" : "→"}
    </span>
  );
}

function Brand({ large = false }) {
  return (
    <a
      className={`brand ${large ? "brand--large" : ""}`}
      href="/"
      aria-label="Meatery home"
    >
      MEATERY<span className="brand-dot">.</span>
    </a>
  );
}

function Header({ menuPage = false }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);
  return (
    <header className={`site-header ${menuPage ? "site-header--solid" : ""}`}>
      <div className="header-inner">
        <Brand />
        <nav
          className={`main-nav ${open ? "main-nav--open" : ""}`}
          aria-label="Main navigation"
        >
          <a href="/" onClick={() => setOpen(false)}>
            Home
          </a>
          <a href="/menu" onClick={() => setOpen(false)}>
            Menu
          </a>
          <a href="/#story" onClick={() => setOpen(false)}>
            Our Story
          </a>
          <a href="/#visit" onClick={() => setOpen(false)}>
            Visit
          </a>
        </nav>
        <div className="header-actions">
          <span className="header-location">MADINAH, SA</span>
          <a className="header-menu-link" href="/menu">
            Explore Menu <Arrow diagonal />
          </a>
          <button
            className={`nav-toggle ${open ? "nav-toggle--open" : ""}`}
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <Brand large />
        <span>
          FIRE, CRAFT & GOOD COMPANY.
          <br />
          MADINAH, SAUDI ARABIA.
        </span>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} MEATERY</span>
        <nav aria-label="Footer navigation">
          <a href="/">HOME</a>
          <a href="/menu">MENU</a>
          <a href="/#visit">VISIT</a>
        </nav>
        <span>MADE FOR THE MOMENTS THAT MATTER.</span>
      </div>
    </footer>
  );
}

function SectionLabel({ number, children }) {
  return (
    <div className="section-label">
      <span>{number}</span>
      <span className="section-label-line" />
      <span>{children}</span>
    </div>
  );
}

function Home() {
  const [contactNotice, setContactNotice] = useState(false);
  useEffect(() => {
    document.title = "Meatery — Madinah";
  }, []);
  return (
    <>
      <Header />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <img
            className="hero-image"
            src={`${ASSET}hero.jpg`}
            alt="Sliced grilled steak on a dark serving board"
            fetchPriority="high"
          />
          <div className="hero-shade" />
          <div className="hero-content container">
            <div className="hero-topline">
              <span className="hero-rule" />{" "}
              <span>THE ART OF FIRE & FLAVOUR</span>
            </div>
            <h1 id="hero-title">
              MEATERY<span>.</span>
            </h1>
            <div className="hero-bottom">
              <div>
                <p className="hero-intro">
                  A better way to gather around the fire.
                </p>
                <p className="hero-place">MADINAH, SAUDI ARABIA</p>
              </div>
              <div className="hero-ctas">
                <a className="button button--light" href="/menu">
                  VIEW MENU <Arrow diagonal />
                </a>
                <a
                  className="text-link text-link--light"
                  href={site.directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  GET DIRECTIONS <Arrow diagonal />
                </a>
              </div>
            </div>
          </div>
          <a
            href="#story"
            className="scroll-cue"
            aria-label="Scroll to our story"
          >
            <span>SCROLL TO EXPLORE</span>
            <span className="scroll-cue-line" />
          </a>
          <div className="hero-side-label">MADINAH · SAUDI ARABIA</div>
        </section>

        <section className="intro-section" id="story">
          <div className="container intro-grid">
            <div>
              <SectionLabel number="01">OUR STORY</SectionLabel>
              <p className="eyebrow intro-aside">
                THE GOOD THINGS
                <br />
                TAKE TIME.
              </p>
            </div>
            <div className="intro-main">
              <h2>
                Not just a meal.
                <br />
                <em>A moment worth sharing.</em>
              </h2>
              <p>
                At Meatery, the flame leads the way. We bring together quality
                cuts, confident cooking, and genuine hospitality for a dining
                experience made to stay with you.
              </p>
              <a className="underlined-link" href="/menu">
                DISCOVER THE MENU <Arrow diagonal />
              </a>
            </div>
          </div>
        </section>

        <section className="craft-section" aria-labelledby="craft-heading">
          <div className="craft-image-wrap">
            <img
              src={`${ASSET}grill.jpg`}
              alt="Beef cooking over a charcoal grill"
              loading="lazy"
            />
          </div>
          <div className="craft-copy">
            <SectionLabel number="02">OUR APPROACH</SectionLabel>
            <div>
              <span className="tiny-star">✳</span>
              <h2 id="craft-heading">
                GOOD FOOD
                <br />
                BEGINS WITH
                <br />
                <i>FIRE.</i>
              </h2>
              <p>
                Nothing rushed. Nothing overworked. Just the pleasure of
                ingredients treated with care, and food cooked the way it should
                be.
              </p>
            </div>
            <div className="craft-note">
              SELECTED WITH CARE&nbsp; / &nbsp;COOKED WITH PURPOSE
            </div>
          </div>
        </section>

        <section className="featured-section" id="featured">
          <div className="container">
            <SectionLabel number="03">A TASTE OF MEATERY</SectionLabel>
            <div className="section-heading-row">
              <h2>
                Made to be
                <br />
                <em>remembered.</em>
              </h2>
              <p>
                A glimpse of what’s to come. Our final menu is being crafted
                with the same care as every plate.
              </p>
            </div>
            <div className="featured-grid">
              <article className="featured-dish featured-dish--first">
                <div className="featured-image">
                  <img
                    src={`${ASSET}plated-steak.jpg`}
                    alt="Sliced steak with roasted garlic and sauce"
                    loading="lazy"
                  />
                </div>
                <div className="dish-meta">
                  <span>01 / THE CLASSICS</span>
                  <h3>Signature Ribeye</h3>
                  <p>Chargrilled. Rested. Worth the wait.</p>
                </div>
              </article>
              <article className="featured-dish featured-dish--second">
                <div className="featured-image">
                  <img
                    src={`${ASSET}burger.jpg`}
                    alt="Premium beef burger"
                    loading="lazy"
                  />
                </div>
                <div className="dish-meta">
                  <span>02 / SOMETHING BOLD</span>
                  <h3>The Meatery Burger</h3>
                  <p>A familiar favourite, done our way.</p>
                </div>
              </article>
              <article className="featured-dish featured-dish--third">
                <div className="featured-image">
                  <img
                    src={`${ASSET}lamb.jpg`}
                    alt="Grilled lamb chops"
                    loading="lazy"
                  />
                </div>
                <div className="dish-meta">
                  <span>03 / FROM THE FLAME</span>
                  <h3>Grilled Lamb Chops</h3>
                  <p>Beautifully simple. Full of flavour.</p>
                </div>
              </article>
            </div>
            <div className="featured-end">
              <span>EXPLORE THE FULL SELECTION</span>
              <a
                className="round-arrow"
                href="/menu"
                aria-label="Explore the full menu"
              >
                ↗
              </a>
            </div>
          </div>
        </section>

        <section className="statement-section">
          <img
            src={`${ASSET}interior.jpg`}
            alt="Warm modern restaurant interior"
            loading="lazy"
          />
          <div className="statement-overlay" />
          <div className="container statement-content">
            <span>THE MEATERY EXPERIENCE</span>
            <h2>
              Come hungry.
              <br />
              Leave with a story.
            </h2>
            <a className="button button--outline" href="/menu">
              EXPLORE OUR MENU <Arrow diagonal />
            </a>
          </div>
        </section>

        <section className="gallery-section">
          <div className="container">
            <SectionLabel number="04">THE MOMENTS</SectionLabel>
            <div className="gallery-heading">
              <h2>A closer look.</h2>
              <span>FOOD. FIRE. FEELING.</span>
            </div>
            <div className="gallery-grid">
              <div className="gallery-image gallery-image--tall">
                <img
                  src={`${ASSET}grill.jpg`}
                  alt="Steak cooking over a live grill"
                  loading="lazy"
                />
              </div>
              <div className="gallery-image">
                <img
                  src={`${ASSET}plated-steak.jpg`}
                  alt="Steak plated for service"
                  loading="lazy"
                />
              </div>
              <div className="gallery-image">
                <img
                  src={`${ASSET}interior.jpg`}
                  alt="Inviting restaurant dining room"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="visit-section" id="visit">
          <div className="container visit-grid">
            <div className="visit-copy">
              <SectionLabel number="05">FIND US</SectionLabel>
              <h2>
                Meet us
                <br />
                in <em>Madinah.</em>
              </h2>
              <p>
                Rooted in the city. Built around the table. We look forward to
                welcoming you to Meatery.
              </p>
              <div className="visit-detail">
                <span>LOCATION</span>
                <strong>{site.location}</strong>
                <small>{site.addressNote}</small>
              </div>
              <div className="visit-detail">
                <span>OPENING HOURS</span>
                <strong>{site.hours}</strong>
                <small>{site.hoursNote}</small>
              </div>
              <a
                className="button button--dark"
                href={site.directionsUrl}
                target="_blank"
                rel="noreferrer"
              >
                OPEN MAPS <Arrow diagonal />
              </a>
            </div>
            <div className="map-panel" aria-label="Stylised map of Madinah">
              <div className="map-streets">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="map-center">
                <div className="map-pin">
                  M<span>.</span>
                </div>
                <span>MADINAH</span>
                <small>SAUDI ARABIA</small>
              </div>
              <span className="map-coordinate">24.47° N / 39.61° E</span>
              <span className="map-caption">MAP TREATMENT · PREVIEW</span>
            </div>
          </div>
        </section>

        <section className="social-section">
          <div className="container social-grid">
            <div>
              <SectionLabel number="06">STAY CLOSE</SectionLabel>
              <h2>
                Beyond
                <br />
                the table.
              </h2>
            </div>
            <div>
              <p>
                New dishes, moments from the kitchen, and everything happening
                around our table. Follow along with Meatery.
              </p>
              {site.instagramUrl ? (
                <a
                  className="social-placeholder"
                  href={site.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  FOLLOW ON INSTAGRAM <Arrow diagonal />
                </a>
              ) : (
                <span className="social-placeholder">
                  INSTAGRAM PROFILE COMING SOON <Arrow diagonal />
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="contact-section">
          <div className="container contact-inner">
            <span>YOUR TABLE IS WAITING</span>
            <h2>
              Let’s make it
              <br />
              <em>a good one.</em>
            </h2>
            {whatsappUrl ? (
              <a
                className="button button--light"
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                CONTACT ON WHATSAPP <Arrow diagonal />
              </a>
            ) : (
              <button
                className="button button--light"
                type="button"
                onClick={() => setContactNotice(true)}
              >
                CONTACT ON WHATSAPP <Arrow diagonal />
              </button>
            )}
            {contactNotice && (
              <p className="contact-notice" role="status">
                The Meatery WhatsApp number will be added before launch.
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function MenuPage() {
  const [language, setLanguage] = useState("en");
  const [active, setActive] = useState(menuCategories[0].id);
  const arabic = language === "ar";
  useEffect(() => {
    document.title = "Menu — Meatery";
    document.documentElement.lang = language;
    document.documentElement.dir = arabic ? "rtl" : "ltr";
    return () => {
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
    };
  }, [language, arabic]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-24% 0px -58% 0px", threshold: [0, 0.2, 0.5, 1] },
    );
    document
      .querySelectorAll(".menu-category")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return (
    <div className={`menu-page ${arabic ? "menu-page--arabic" : ""}`}>
      <Header menuPage />
      <main>
        <section className="menu-hero">
          <div className="menu-hero-image">
            <img src={`${ASSET}hero.jpg`} alt="Premium grilled steak" />
          </div>
          <div className="container menu-hero-content">
            <span className="menu-kicker">
              {arabic ? "ميتري · المدينة المنورة" : "MEATERY · MADINAH"}
            </span>
            <h1>
              {arabic ? "القائمة" : "THE MENU"}
              <span>.</span>
            </h1>
            <p>
              {arabic
                ? "نكهات من النار، صنعت لتُشارك."
                : "From the fire, made to share."}
            </p>
          </div>
        </section>
        <div className="menu-toolbar">
          <div className="container menu-toolbar-inner">
            <span>{arabic ? "استكشف القائمة" : "EXPLORE THE MENU"}</span>
            <div
              className="language-switch"
              role="group"
              aria-label="Menu language"
            >
              <button
                className={!arabic ? "active" : ""}
                type="button"
                onClick={() => setLanguage("en")}
                aria-pressed={!arabic}
              >
                EN
              </button>
              <span>/</span>
              <button
                className={arabic ? "active" : ""}
                type="button"
                onClick={() => setLanguage("ar")}
                aria-pressed={arabic}
              >
                عربي
              </button>
            </div>
          </div>
        </div>
        <div className="menu-layout container">
          <aside className="category-sidebar">
            <span className="sidebar-title">
              {arabic ? "الأقسام" : "CATEGORIES"}
            </span>
            <nav aria-label="Menu categories">
              {menuCategories.map((category, i) => (
                <a
                  key={category.id}
                  className={active === category.id ? "active" : ""}
                  href={`#${category.id}`}
                  onClick={() => setActive(category.id)}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {arabic ? category.ar : category.en}
                </a>
              ))}
            </nav>
            <div className="sidebar-mark">
              M<span>.</span>
            </div>
          </aside>
          <div className="menu-content">
            <div className="preview-note">
              <span className="preview-dot" />
              <p>
                {arabic
                  ? "هذه قائمة تجريبية. الأصناف والأسعار النهائية ستُضاف قريباً."
                  : "Preview menu. Final dishes and prices will be added soon."}
              </p>
            </div>
            <nav className="mobile-categories" aria-label="Menu categories">
              {menuCategories.map((category) => (
                <a
                  key={category.id}
                  className={active === category.id ? "active" : ""}
                  href={`#${category.id}`}
                  onClick={() => setActive(category.id)}
                >
                  {arabic ? category.ar : category.en}
                </a>
              ))}
            </nav>
            {menuCategories.map((category, index) => (
              <section
                className="menu-category"
                id={category.id}
                key={category.id}
              >
                <div className="menu-category-heading">
                  <span>
                    {String(index + 1).padStart(2, "0")} /{" "}
                    {arabic ? "القائمة" : "MENU"}
                  </span>
                  <h2>
                    {arabic ? category.ar : category.en}
                    <i>.</i>
                  </h2>
                  <p>
                    {arabic ? category.descriptionAr : category.descriptionEn}
                  </p>
                </div>
                <div className="menu-items">
                  {category.items.map((item) => (
                    <article className="menu-item" key={item.en}>
                      <div>
                        <h3>
                          {arabic ? item.ar : item.en}
                          {item.featured && (
                            <span
                              className="menu-item-mark"
                              aria-label="Featured dish"
                            >
                              ✳
                            </span>
                          )}
                        </h3>
                        <p>{arabic ? item.detailAr : item.detailEn}</p>
                      </div>
                      <span className="menu-price">
                        {item.price == null
                          ? arabic
                            ? "قريباً"
                            : "TBC"
                          : `${item.price} SAR`}
                      </span>
                    </article>
                  ))}
                </div>
              </section>
            ))}
            <div className="menu-end">
              <span>✳</span>
              <p>
                {arabic ? "نراكم حول المائدة." : "See you around the table."}
              </p>
              <a href="/">
                {arabic ? "العودة للرئيسية" : "BACK TO HOME"} <Arrow diagonal />
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  window.location.pathname.replace(/\/$/, "") === "/menu" ? (
    <MenuPage />
  ) : (
    <Home />
  ),
);
