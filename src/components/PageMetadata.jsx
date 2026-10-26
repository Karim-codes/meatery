import { useEffect } from "react";
import { getPageUrl } from "../data/site";

function setMeta(attribute, name, content) {
  let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.append(element);
  }
  element.content = content;
}

export function PageMetadata({ title, description, language, path }) {
  useEffect(() => {
    document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:locale", language === "ar" ? "ar_SA" : "en_GB");
    const pageUrl = getPageUrl(path, language, window.location.origin);
    setMeta("property", "og:url", pageUrl);
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = pageUrl;
  }, [title, description, language, path]);
  return null;
}
