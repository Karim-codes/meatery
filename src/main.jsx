import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "./context/LanguageContext";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import { site } from "./data/site";
import "./styles.css";

const path = window.location.pathname.replace(/\/$/, "");
const labEnabled =
  import.meta.env.MODE === "moyasar-lab" &&
  import.meta.env.VITE_MOYASAR_LAB_ENABLED === "true";
const MoyasarLab = labEnabled
  ? lazy(() => import("./lab/moyasar/MoyasarLab"))
  : null;
createRoot(document.getElementById("root")).render(
  <LanguageProvider>
    {MoyasarLab &&
    ["/lab/moyasar", "/lab/moyasar/result", "/lab/moyasar/kitchen"].includes(
      path,
    ) ? (
      <Suspense
        fallback={
          <p style={{ color: "#f3f1eb", padding: 32 }}>Loading sandbox…</p>
        }
      >
        <MoyasarLab />
      </Suspense>
    ) : ["/menu", site.qrMenuPath].includes(path) ? (
      <MenuPage tableMode={path === site.qrMenuPath} />
    ) : (
      <HomePage />
    )}
  </LanguageProvider>,
);
