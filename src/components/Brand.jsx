import React from "react";
import { useLanguage } from "../context/LanguageContext";
export function Brand({ large = false }) {
  const { arabic, href } = useLanguage();
  return (
    <a
      className={`brand ${large ? "brand--large" : ""}`}
      href={href("/")}
      aria-label={arabic ? "ميتري — الرئيسية" : "Meatery home"}
      dir="ltr"
    >
      <img
        className="brand-symbol"
        src="/brand-mark.svg"
        alt=""
        aria-hidden="true"
      />
      <span className="brand-wordmark" lang="en">
        MEATERY<span className="brand-dot">.</span>
      </span>
    </a>
  );
}
