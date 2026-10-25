import React from "react";
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "./context/LanguageContext";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import "./styles.css";

const path = window.location.pathname.replace(/\/$/, "");
createRoot(document.getElementById("root")).render(
  <LanguageProvider>
    {["/menu", "/menu-qr-code"].includes(path) ? (
      <MenuPage tableMode={path === "/menu-qr-code"} />
    ) : (
      <HomePage />
    )}
  </LanguageProvider>,
);
