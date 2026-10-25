import React from "react";
import { navigationCopy } from "../data/homeCopy";
export function NavigationToggle({ open = false, language = "en", onClick }) {
  const copy = navigationCopy[language];
  return (
    <button
      className="kinetic-toggle"
      type="button"
      data-open={open}
      aria-label={open ? copy.close : copy.open}
      aria-expanded={open}
      aria-controls="mobile-navigation"
      aria-haspopup="dialog"
      onClick={onClick}
    >
      <span className="kinetic-toggle-window" aria-hidden="true">
        <span className="kinetic-toggle-text">
          <span>{copy.toggle}</span>
          <span>{copy.closeText}</span>
        </span>
      </span>
      <svg
        viewBox="0 0 20 20"
        className="kinetic-toggle-icon"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M10 2v16M2 10h16" />
      </svg>
    </button>
  );
}
