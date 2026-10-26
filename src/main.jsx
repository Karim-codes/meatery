import React from "react";
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "./context/LanguageContext";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import { site } from "./data/site";
import "./styles.css";

const path = window.location.pathname.replace(/\/$/, "");
createRoot(document.getElementById("root")).render(
  <LanguageProvider>
    {["/menu", site.qrMenuPath].includes(path) ? (
      <MenuPage tableMode={path === site.qrMenuPath} />
    ) : (
      <HomePage />
    )}
  </LanguageProvider>,
);
