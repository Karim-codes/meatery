import React, { useEffect, useState } from "react";
import { Header, Footer } from "../components/SiteChrome";
import { Arrow } from "../components/Icons";
import { BrandMark } from "../components/BrandMark";
import { useLanguage } from "../context/LanguageContext";
import { homeCopy } from "../data/homeCopy";
import { site } from "../data/site";
import "./home.css";

const ASSET = "/images/";
const whatsappUrl = site.whatsappNumber
  ? `https://wa.me/${site.whatsappNumber}`
  : "";
const featuredClasses = ["first", "second", "third"];
function SectionLabel({ number, children }) {
  const { arabic } = useLanguage();
  const label = arabic
    ? new Intl.NumberFormat("ar-SA", { minimumIntegerDigits: 2 }).format(
        Number(number),
      )
    : number;
  return (
    <div className="section-label">
      <span>{label}</span>
      <span className="section-label-line" />
      <span>{children}</span>
    </div>
  );
}
export default function HomePage() {
  const { language, arabic, href } = useLanguage();
  const copy = homeCopy[language];
  const [contactNotice, setContactNotice] = useState(false);
  useEffect(() => {
    document.title = copy.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", copy.description);
  }, [copy]);
  useEffect(() => {
    const anchor = window.location.hash.slice(1);
    if (!anchor) return;
    const frame = requestAnimationFrame(() =>
      document.getElementById(anchor)?.scrollIntoView(),
    );
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div className={`home-page ${arabic ? "home-page--arabic" : ""}`}>
      <Header />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <img
            className="hero-image"
            src={`${ASSET}hero.jpg`}
            alt={copy.heroAlt}
            fetchPriority="high"
          />
          <div className="hero-shade" />
          <div className="hero-content container">
            <div className="hero-topline">
              <span className="hero-rule" />
              <span>{copy.heroTag}</span>
            </div>
            <h1 id="hero-title" dir="ltr" lang="en">
              MEATERY<span>.</span>
            </h1>
            <div className="hero-bottom">
              <div>
                <p className="hero-intro">{copy.heroIntro}</p>
                <p className="hero-place">{copy.place}</p>
              </div>
              <div className="hero-ctas">
                <a className="button button--light" href={href("/menu")}>
                  {copy.viewMenu}
                  <Arrow diagonal />
                </a>
                <a
                  className="text-link text-link--light"
                  href={site.directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {copy.directions}
                  <Arrow diagonal />
                </a>
              </div>
            </div>
          </div>
          <a href="#story" className="scroll-cue" aria-label={copy.scrollLabel}>
            <span>{copy.scroll}</span>
            <span className="scroll-cue-line" />
          </a>
          <div className="hero-side-label">{copy.place}</div>
        </section>
        <section className="intro-section" id="story">
          <div className="container intro-grid">
            <div>
              <SectionLabel number="01">{copy.story.label}</SectionLabel>
              <p className="eyebrow intro-aside">
                {copy.story.aside[0]}
                <br />
                {copy.story.aside[1]}
              </p>
            </div>
            <div className="intro-main">
              <h2>
                {copy.story.title}
                <br />
                <em>{copy.story.emphasis}</em>
              </h2>
              <p>{copy.story.body}</p>
              <a className="underlined-link" href={href("/menu")}>
                {copy.story.cta}
                <Arrow diagonal />
              </a>
            </div>
          </div>
        </section>
        <section className="craft-section" aria-labelledby="craft-heading">
          <div className="craft-image-wrap">
            <img
              src={`${ASSET}grill.jpg`}
              alt={copy.craft.imageAlt}
              loading="lazy"
            />
          </div>
          <div className="craft-copy">
            <SectionLabel number="02">{copy.craft.label}</SectionLabel>
            <div>
              <BrandMark className="craft-brand-mark" />
              <h2 id="craft-heading">
                {copy.craft.lines[0]}
                <br />
                {copy.craft.lines[1]}
                <br />
                <i>{copy.craft.emphasis}</i>
              </h2>
              <p>{copy.craft.body}</p>
            </div>
            <div className="craft-note">{copy.craft.note}</div>
          </div>
        </section>
        <section className="featured-section" id="featured">
          <div className="container">
            <SectionLabel number="03">{copy.featured.label}</SectionLabel>
            <div className="section-heading-row">
              <h2>
                {copy.featured.title}
                <br />
                <em>{copy.featured.emphasis}</em>
              </h2>
              <p>{copy.featured.body}</p>
            </div>
            <div className="featured-grid">
              {copy.featured.dishes.map((dish, index) => (
                <article
                  className={`featured-dish featured-dish--${featuredClasses[index]}`}
                  key={dish.image}
                >
                  <div className="featured-image">
                    <img
                      src={`${ASSET}${dish.image}`}
                      alt={dish.alt}
                      loading="lazy"
                    />
                  </div>
                  <div className="dish-meta">
                    <span>{dish.kicker}</span>
                    <h3>{dish.title}</h3>
                    <p>{dish.detail}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="featured-end">
              <span>{copy.featured.cta}</span>
              <a
                className="round-arrow"
                href={href("/menu")}
                aria-label={copy.featured.linkLabel}
              >
                <Arrow diagonal />
              </a>
            </div>
          </div>
        </section>
        <section className="statement-section">
          <img
            src={`${ASSET}interior.jpg`}
            alt={copy.statement.imageAlt}
            loading="lazy"
          />
          <div className="statement-overlay" />
          <div className="container statement-content">
            <span>{copy.statement.label}</span>
            <h2>
              {copy.statement.lines[0]}
              <br />
              {copy.statement.lines[1]}
            </h2>
            <a className="button button--outline" href={href("/menu")}>
              {copy.statement.cta}
              <Arrow diagonal />
            </a>
          </div>
        </section>
        <section className="gallery-section">
          <div className="container">
            <SectionLabel number="04">{copy.gallery.label}</SectionLabel>
            <div className="gallery-heading">
              <h2>{copy.gallery.title}</h2>
              <span>{copy.gallery.aside}</span>
            </div>
            <div className="gallery-grid">
              {["grill.jpg", "plated-steak.jpg", "interior.jpg"].map(
                (image, index) => (
                  <div
                    className={`gallery-image ${index === 0 ? "gallery-image--tall" : ""}`}
                    key={image}
                  >
                    <img
                      src={`${ASSET}${image}`}
                      alt={copy.gallery.alts[index]}
                      loading="lazy"
                    />
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
        <section className="visit-section" id="visit">
          <div className="container visit-grid">
            <div className="visit-copy">
              <SectionLabel number="05">{copy.visit.label}</SectionLabel>
              <h2>
                {copy.visit.title}
                <br />
                {copy.visit.preposition} <em>{copy.visit.emphasis}</em>
              </h2>
              <p>{copy.visit.body}</p>
              <div className="visit-detail">
                <span>{copy.visit.location}</span>
                <strong>{arabic ? site.locationAr : site.location}</strong>
                <small>{arabic ? site.addressNoteAr : site.addressNote}</small>
              </div>
              <div className="visit-detail">
                <span>{copy.visit.hours}</span>
                <strong>{arabic ? site.hoursAr : site.hours}</strong>
                <small>{arabic ? site.hoursNoteAr : site.hoursNote}</small>
              </div>
              <a
                className="button button--dark"
                href={site.directionsUrl}
                target="_blank"
                rel="noreferrer"
              >
                {copy.visit.cta}
                <Arrow diagonal />
              </a>
            </div>
            <div className="map-panel" aria-label={copy.visit.mapLabel}>
              <div className="map-streets">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="map-center">
                <div className="map-pin" dir="ltr">
                  M<span>.</span>
                </div>
                <span>{copy.visit.city}</span>
                <small>{copy.visit.country}</small>
              </div>
              <span className="map-coordinate" dir="ltr">
                24.47° N / 39.61° E
              </span>
              <span className="map-caption">{copy.visit.mapCaption}</span>
            </div>
          </div>
        </section>
        <section className="social-section">
          <div className="container social-grid">
            <div>
              <SectionLabel number="06">{copy.social.label}</SectionLabel>
              <h2>
                {copy.social.lines[0]}
                <br />
                {copy.social.lines[1]}
              </h2>
            </div>
            <div>
              <p>{copy.social.body}</p>
              {site.instagramUrl ? (
                <a
                  className="social-placeholder"
                  href={site.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {copy.social.cta}
                  <Arrow diagonal />
                </a>
              ) : (
                <span className="social-placeholder">
                  {copy.social.pending}
                  <Arrow diagonal />
                </span>
              )}
            </div>
          </div>
        </section>
        <section className="contact-section" id="contact">
          <div className="container contact-inner">
            <span>{copy.contact.label}</span>
            <h2>
              {copy.contact.title}
              <br />
              <em>{copy.contact.emphasis}</em>
            </h2>
            {whatsappUrl ? (
              <a
                className="button button--light"
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                {copy.contact.cta}
                <Arrow diagonal />
              </a>
            ) : (
              <button
                className="button button--light"
                type="button"
                onClick={() => setContactNotice(true)}
              >
                {copy.contact.cta}
                <Arrow diagonal />
              </button>
            )}
            {contactNotice && (
              <p className="contact-notice" role="status">
                {copy.contact.pending}
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
