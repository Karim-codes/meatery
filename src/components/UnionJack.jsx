import React from "react";

// Hand-drawn 5:3 Union Flag. The offset red saltires keep the broader white
// diagonal above the red at the upper hoist. Intentionally never mirrored in RTL.
// Tonal colours suit Meatery's paper-and-ink palette; the adjacent label explains
// the UK origins, so this supporting illustration is decorative to screen readers.
export function UnionJack() {
  return (
    <svg
      className="origins-union-jack"
      viewBox="0 0 50 30"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path fill="#28313a" d="M0 0h50v30H0z" />
      <path
        d="m0 0 50 30M50 0 0 30"
        fill="none"
        stroke="#f6f2e9"
        strokeWidth="6"
      />
      <path
        fill="#874b45"
        d="M0 0 25 15 23.971 16.715-1.029 1.715Zm50 0L25 15l-1.029-1.715 25-15ZM0 30l25-15 1.029 1.715-25 15ZM25 15l25 15 1.029-1.715-25-15Z"
      />
      <path
        d="M25 0v30M0 15h50"
        fill="none"
        stroke="#f6f2e9"
        strokeWidth="10"
      />
      <path d="M25 0v30M0 15h50" fill="none" stroke="#874b45" strokeWidth="6" />
    </svg>
  );
}
