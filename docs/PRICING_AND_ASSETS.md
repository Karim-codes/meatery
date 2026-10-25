# Preview prices and vector assets

## Prices

The client supplied 42 dish names without prices. At the user's request, the menu now contains illustrative Saudi-riyal estimates for the client preview. They are not represented as Meatery-approved prices: both menu pages and every dish dialog explicitly identify them as estimates. No recipes, portion sizes, allergen claims, or tax treatment were inferred.

The estimates put beef burgers around 32–51 riyals, chicken at 29–35, sides at 12–29, sweets at 16–32, drinks at 5–26, sauces at 4–7, and conditional grill specials at 49–99. Smash options are priced independently and increase with the number of patties. These are design estimates, not a claim about Meatery's pricing. For broad context only, reviewed the [FryB menu](https://www.fryb.sa/menu) and [Burger Boutique's published menu](https://almamlakasocialdining.com/wp-content/uploads/2024/07/bb-menu-3.pdf); their recipes and prices were not copied.

Update each dish/option's `price` in `src/data/menu.js` when actual prices are supplied, then set `menuPricing.estimated` to `false` to remove the preview notices. Unknown prices still fall back to asking the restaurant team.

## Saudi riyal symbol

`src/components/RiyalPrice.jsx` preserves the Saudi Central Bank's SVG geometry and inherits the surrounding text colour. Currency presentation uses a symbol to the left of the localized number, with a gap and matching text height. This follows the [Saudi Central Bank usage guide](https://www.sama.gov.sa/ar-sa/Currency/SRS/Documents/Guidelines.pdf). A vector avoids depending on support for a new Unicode glyph on guests' phones.

The [original SAMA SVG](https://www.sama.gov.sa/ar-sa/Currency/Documents/Saudi_Riyal_Symbol-2.svg) was unavailable during implementation, so its published copy was retrieved from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Saudi_Riyal_Symbol.svg), which attributes the design to SAMA and links to that original source. Only the fill was changed to `currentColor`; the paths and proportions are unchanged.

## Meatery mark

Decorative star/asterisk accents have been replaced by `src/components/BrandMark.jsx`, using exactly the M + flame paths from the supplied logo recreation in `public/brand-mark.svg`. It inherits the surrounding colour. No emoji or font glyph is used for the mark or for currency.
