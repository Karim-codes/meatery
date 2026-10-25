import React from "react";

export function Arrow({ diagonal = false }) {
  return (
    <svg
      className="arrow"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h16m-7-7 7 7-7 7"} />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg
      className="menu-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg
      className="menu-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m6 6 12 12M6 18 18 6" />
    </svg>
  );
}

export function CategoriesIcon() {
  return (
    <svg
      className="menu-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 4h5v5H4zM15 4h5v5h-5zM4 15h5v5H4zM15 15h5v5h-5z" />
    </svg>
  );
}
