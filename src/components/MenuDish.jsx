import React, { useEffect, useRef } from "react";
import { Arrow, CloseIcon } from "./Icons";
import { BrandMark } from "./BrandMark";
import { RiyalPrice } from "./RiyalPrice";
import { menuPricing } from "../data/menu";
import { menuItemPrice } from "../utils/menu";

export function MenuItem({ item, language, selectedOptionId, onOpen }) {
  const arabic = language === "ar";
  const price = menuItemPrice(item, selectedOptionId);
  const description = arabic ? item.detailAr : item.detailEn;
  return (
    <article className="qr-dish" aria-labelledby={`dish-${item.id}`}>
      <div className="qr-dish-heading">
        <div>
          <h3 id={`dish-${item.id}`}>
            <button
              className="qr-dish-trigger"
              type="button"
              aria-haspopup="dialog"
              aria-label={
                arabic ? `تفاصيل ${item.ar}` : `View ${item.en} details`
              }
              onClick={onOpen}
            >
              {arabic ? item.ar : item.en}
            </button>
          </h3>
          {arabic && (
            <p className="qr-dish-original" lang="en" dir="ltr">
              {item.en}
            </p>
          )}
          {description && <p className="qr-dish-description">{description}</p>}
          {item.options && (
            <p className="qr-dish-option-hint">
              {item.options
                .map((option) => (arabic ? option.ar : option.en))
                .join(" / ")}
            </p>
          )}
        </div>
        <div className="qr-dish-trailing">
          <RiyalPrice
            value={price}
            language={language}
            className="qr-dish-price"
            estimated={menuPricing.estimated}
          />
          <Arrow diagonal />
        </div>
      </div>
    </article>
  );
}

function DishOptions({ item, language, selectedOptionId, onChange }) {
  if (!item.options) return null;
  const arabic = language === "ar";
  const optionId = selectedOptionId || item.options[0].id;
  return (
    <fieldset
      className="qr-dish-options"
      aria-labelledby="dish-dialog-title dish-options-label"
    >
      <legend id="dish-options-label">
        {arabic ? item.optionLabelAr : item.optionLabelEn}
      </legend>
      <div>
        {item.options.map((option) => (
          <label key={option.id}>
            <input
              type="radio"
              name={`detail-option-${item.id}`}
              value={option.id}
              checked={optionId === option.id}
              onChange={() => onChange(option.id)}
            />
            <span>{arabic ? option.ar : option.en}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function DishDetailsDialog({
  entry,
  language,
  selectedOptionId,
  onOptionChange,
  onClose,
}) {
  const dialogRef = useRef(null);
  const arabic = language === "ar";
  useEffect(() => {
    const dialog = dialogRef.current;
    if (entry && !dialog.open) {
      dialog.showModal();
      dialog.scrollTop = 0;
    } else if (!entry && dialog.open) {
      dialog.close();
    }
  }, [entry]);

  const item = entry?.item;
  const category = entry?.category;
  const price = item ? menuItemPrice(item, selectedOptionId) : null;
  const ingredients =
    item && (arabic ? item.ingredientsAr : item.ingredientsEn);
  const description = item && (arabic ? item.detailAr : item.detailEn);
  function close() {
    dialogRef.current?.close();
  }

  return (
    <dialog
      className="qr-dish-dialog"
      ref={dialogRef}
      aria-labelledby="dish-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          close();
      }}
    >
      {item && (
        <>
          <button
            className="qr-icon-button qr-dish-detail-close"
            type="button"
            autoFocus
            aria-label={arabic ? "إغلاق تفاصيل الطبق" : "Close dish details"}
            onClick={close}
          >
            <CloseIcon />
          </button>
          <div className="qr-dish-dialog-layout">
            <div className="qr-dish-detail-copy">
              <span className="qr-eyebrow">
                {arabic ? category.ar : category.en}
              </span>
              <h2 id="dish-dialog-title">
                {arabic ? item.ar : item.en}
                <span>.</span>
              </h2>
              {arabic && (
                <p className="qr-detail-original" lang="en" dir="ltr">
                  {item.en}
                </p>
              )}
              {description && (
                <p className="qr-detail-description">{description}</p>
              )}
              {category.availability === "limited" && (
                <p className="qr-availability-note">
                  <BrandMark />
                  {arabic
                    ? "حسب التوفّر. يرجى الاستفسار من فريقنا."
                    : "Subject to availability. Please ask our team."}
                </p>
              )}
              <div
                className="qr-detail-pricing"
                aria-live="polite"
                aria-atomic="true"
              >
                {price != null ? (
                  <>
                    <RiyalPrice
                      value={price}
                      language={language}
                      className="qr-detail-price"
                      estimated={menuPricing.estimated}
                    />
                    {menuPricing.estimated && (
                      <small className="qr-detail-estimate">
                        {arabic
                          ? "سعر تقديري للمعاينة"
                          : "Estimated preview price"}
                      </small>
                    )}
                  </>
                ) : (
                  <p className="qr-detail-price-note">
                    {arabic
                      ? "يرجى الاستفسار من فريقنا عن الأسعار."
                      : "Please ask our team for prices."}
                  </p>
                )}
              </div>
              <DishOptions
                item={item}
                language={language}
                selectedOptionId={selectedOptionId}
                onChange={onOptionChange}
              />
              <div className="qr-detail-ingredients">
                <h3>
                  {arabic
                    ? "المكوّنات والحساسية الغذائية"
                    : "INGREDIENTS & ALLERGENS"}
                </h3>
                {ingredients?.length ? (
                  <ul>
                    {ingredients.map((ingredient) => (
                      <li key={ingredient}>{ingredient}</li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    {arabic
                      ? "يسعد فريقنا إطلاعك على المكوّنات ومساعدتك بشأن أي حساسية غذائية."
                      : "Our team can help with ingredients and any food allergies. Please ask before ordering."}
                  </p>
                )}
              </div>
              <button type="button" className="qr-dish-back" onClick={close}>
                <Arrow />
                {arabic ? "العودة إلى القائمة" : "BACK TO THE MENU"}
              </button>
            </div>
            <div
              className={`qr-dish-detail-media ${item.image ? "" : "qr-dish-detail-media--brand"}`}
            >
              {item.image ? (
                <img
                  className="qr-dish-detail-photo"
                  src={item.image}
                  alt={
                    arabic
                      ? item.imageAltAr || item.ar
                      : item.imageAltEn || item.en
                  }
                  decoding="async"
                />
              ) : (
                <div className="qr-dish-brand-art" aria-hidden="true">
                  <span className="qr-detail-art-kicker">
                    MEATERY / MADINAH
                  </span>
                  <img src="/brand-mark.svg" alt="" />
                  <span className="qr-detail-art-line">
                    FIRE, CRAFT & GOOD COMPANY.
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}
