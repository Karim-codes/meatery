import React, { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Brand } from "../Brand";
import { NavigationToggle } from "../NavigationToggle";
import { Arrow } from "../Icons";
import { navigationCopy } from "../../data/homeCopy";

type Language = "en" | "ar";
type Link = { label: string; href: string };
type Props = {
  open: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
  links: Link[];
};

if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
  CustomEase.create("meatery-navigation", "0.65, 0.01, 0.05, 0.99");
}

// Adapted from the supplied Sterling Gate component: scoped panel transitions,
// staggered links, rolling toggle, and ambient hover movement in Meatery's palette.
export default function KineticNavigation({
  open,
  onClose,
  language,
  onLanguageChange,
  links,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contextRef = useRef<gsap.Context | null>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const pendingHref = useRef<string | null>(null);
  const directionRef = useRef(1);
  const copy = navigationCopy[language];
  const arabic = language === "ar";

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const panels = dialog.querySelectorAll(".kinetic-backdrop-layer");
    const menuLinks = dialog.querySelectorAll(".kinetic-link");
    const fadeTargets = dialog.querySelectorAll("[data-menu-fade]");
    const header = dialog.querySelector(".kinetic-nav-header");

    if (open) {
      animationRef.current?.kill();
      contextRef.current?.revert();
      directionRef.current = arabic ? -1 : 1;
      if (!dialog.open) dialog.showModal();
      dialog.dataset.state = "open";
      document.body.classList.add("nav-open");
      contextRef.current = gsap.context(() => {
        const duration = reduced ? 0 : 0.575;
        animationRef.current = gsap
          .timeline({ defaults: { ease: "meatery-navigation", duration } })
          .fromTo(
            panels,
            { xPercent: 101 * directionRef.current },
            { xPercent: 0, stagger: reduced ? 0 : 0.08 },
          )
          .fromTo(
            header,
            { opacity: 0 },
            { opacity: 1, duration: reduced ? 0 : 0.22 },
            reduced ? 0 : 0.24,
          )
          .fromTo(
            menuLinks,
            { yPercent: 135, rotation: 7 * directionRef.current },
            {
              yPercent: 0,
              rotation: 0,
              stagger: reduced ? 0 : 0.055,
              duration: reduced ? 0 : 0.58,
            },
            reduced ? 0 : 0.28,
          )
          .fromTo(
            fadeTargets,
            { autoAlpha: 0, y: 16 },
            {
              autoAlpha: 1,
              y: 0,
              duration: reduced ? 0 : 0.38,
              stagger: reduced ? 0 : 0.04,
            },
            reduced ? 0 : 0.47,
          );
      }, dialog);
      dialog
        .querySelector<HTMLButtonElement>(".kinetic-toggle")
        ?.focus({ preventScroll: true });
    } else if (dialog.open) {
      animationRef.current?.kill();
      dialog.dataset.state = "closing";
      const finish = () => {
        dialog.close();
        contextRef.current?.revert();
        contextRef.current = null;
        document.body.classList.remove("nav-open");
        const target = pendingHref.current;
        pendingHref.current = null;
        if (target) window.location.assign(target);
      };
      if (reduced) {
        finish();
        return;
      }
      contextRef.current?.add(() => {
        animationRef.current = gsap
          .timeline({ onComplete: finish })
          .to([menuLinks, fadeTargets, header], {
            autoAlpha: 0,
            duration: 0.18,
            ease: "power1.out",
          })
          .to(
            panels,
            {
              xPercent: 101 * directionRef.current,
              stagger: -0.045,
              duration: 0.44,
              ease: "meatery-navigation",
            },
            0.06,
          );
      });
    }
  }, [open]);

  useEffect(
    () => () => {
      animationRef.current?.kill();
      contextRef.current?.revert();
      dialogRef.current?.close();
      document.body.classList.remove("nav-open");
    },
    [],
  );

  function activateAmbient(index: number) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mark = dialogRef.current?.querySelector(".kinetic-ambient-mark");
    if (!mark) return;
    contextRef.current?.add(() => {
      gsap.to(mark, {
        rotation: (index - 2) * 6,
        scale: 0.94 + index * 0.025,
        opacity: 0.06 + index * 0.008,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  }
  function navigate(
    event: React.MouseEvent<HTMLAnchorElement>,
    target: string,
  ) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    )
      return;
    event.preventDefault();
    pendingHref.current = target;
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      id="mobile-navigation"
      className={`kinetic-nav-dialog ${arabic ? "kinetic-nav-dialog--arabic" : ""}`}
      aria-label={copy.navLabel}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        document.body.classList.remove("nav-open");
      }}
    >
      <div className="kinetic-nav-panels" aria-hidden="true">
        <div className="kinetic-backdrop-layer kinetic-backdrop-layer--first" />
        <div className="kinetic-backdrop-layer kinetic-backdrop-layer--second" />
        <div className="kinetic-backdrop-layer" />
      </div>
      <div className="kinetic-nav-surface">
        <header className="kinetic-nav-header">
          <Brand />
          <NavigationToggle open={open} language={language} onClick={onClose} />
        </header>
        <img
          className="kinetic-ambient-mark"
          src="/brand-mark.svg"
          alt=""
          aria-hidden="true"
        />
        <div className="kinetic-nav-content">
          <span className="kinetic-nav-kicker" data-menu-fade>
            {copy.title}
          </span>
          <nav aria-label={copy.navLabel}>
            <ul className="kinetic-menu-list">
              {links.map((link, index) => (
                <li
                  className="kinetic-list-item"
                  key={link.href}
                  data-shape={index + 1}
                >
                  <a
                    className="kinetic-link"
                    href={link.href}
                    onClick={(event) => navigate(event, link.href)}
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse") activateAmbient(index);
                    }}
                    onFocus={() => activateAmbient(index)}
                  >
                    <span className="kinetic-link-number">
                      {new Intl.NumberFormat(arabic ? "ar-SA" : "en", {
                        minimumIntegerDigits: 2,
                      }).format(index + 1)}
                    </span>
                    <span>{link.label}</span>
                    <Arrow diagonal />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="kinetic-nav-footer" data-menu-fade>
            <button
              className="kinetic-language-switch"
              type="button"
              onClick={() => onLanguageChange(arabic ? "en" : "ar")}
              aria-label={copy.switchLabel}
              lang={arabic ? "en" : "ar"}
            >
              {copy.switchLanguage}
              <Arrow diagonal />
            </button>
            <span>{copy.location}</span>
          </div>
        </div>
      </div>
    </dialog>
  );
}
