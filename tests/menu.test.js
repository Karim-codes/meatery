import test from "node:test";
import assert from "node:assert/strict";
import { menuCategories, menuPricing } from "../src/data/menu.js";
import {
  filterMenu,
  formatMenuPrice,
  menuItemCount,
  normalizeMenuText,
  menuItemPrice,
  formatMenuAmount,
} from "../src/utils/menu.js";

const ids = (categories) =>
  categories.flatMap((category) => category.items.map((item) => item.id));

test("every dish and selectable option has a numeric preview estimate", () => {
  assert.equal(menuPricing.estimated, true);
  for (const category of menuCategories)
    for (const item of category.items) {
      assert.ok(Number.isFinite(item.price) && item.price > 0, item.id);
      for (const option of item.options || [])
        assert.ok(
          Number.isFinite(option.price) && option.price > 0,
          `${item.id}:${option.id}`,
        );
    }
  const smash = menuCategories
    .find((category) => category.id === "beef")
    .items.filter((item) => item.options);
  for (const item of smash)
    assert.ok(
      item.options[0].price < item.options[1].price &&
        item.options[1].price < item.options[2].price,
    );
});

test("currency values localize independently of the SVG riyal symbol", () => {
  assert.equal(formatMenuAmount(42, "en"), "42");
  assert.equal(formatMenuAmount(42, "ar"), "٤٢");
  assert.equal(formatMenuAmount(39.5, "en"), "39.5");
  assert.equal(formatMenuAmount(0), "0");
  assert.equal(formatMenuAmount(null), null);
});

test("the menu contains exactly the client-supplied dish names", () => {
  const approved = [
    "House Burger",
    "Mac Attack",
    "Mad about Cheese",
    "Texas BBQ",
    "Siesta Fiesta",
    "Oklahoma Smash",
    "Texas Smash",
    "Classic",
    "Nashville",
    "Seoul Mate",
    "Don Taco",
    "Philly Melt",
    "Cluck Norris",
    "Loaded Fries Beef",
    "Loaded Fries Chicken",
    "Loaded Nachos",
    "Mac N Cheese Balls",
    "House Fries",
    "House Slaw",
    "Halloumi Fries",
    "Pistachio Delight",
    "Chocoholic",
    "Milk Cake",
    "It’s a Date",
    "Ice Cream",
    "Going Nuts",
    "Lotus",
    "Pink Sip",
    "Ice Tea",
    "Soft Drinks",
    "House Mocktail",
    "Water",
    "Atlas Heat",
    "House Burger Sauce",
    "Shroom Sauce",
    "Sweet and Chilli",
    "Melting Pot",
    "Spicy Queso",
    "Fish & Chips",
    "Brisket",
    "Ribs",
    "Steak on Mash / Chips",
  ];
  assert.deepEqual(
    menuCategories
      .flatMap((category) => category.items.map((item) => item.en))
      .sort(),
    approved.sort(),
  );
});

test("the supplied menu has 42 distinct entries, with the four specials clearly conditional", () => {
  assert.equal(menuItemCount(menuCategories), 42);
  assert.equal(new Set(ids(menuCategories)).size, 42);
  const specials = menuCategories.find(
    (category) => category.id === "specials",
  );
  assert.equal(specials.availability, "limited");
  assert.deepEqual(ids([specials]), [
    "fish-and-chips",
    "brisket",
    "ribs",
    "steak-on-mash-chips",
  ]);
});

test("English and Arabic queries find the same dishes regardless of display language", () => {
  assert.deepEqual(ids(filterMenu(menuCategories, "all", "PhIlLy")), [
    "philly-melt",
  ]);
  assert.deepEqual(ids(filterMenu(menuCategories, "all", "فِيلي")), [
    "philly-melt",
  ]);
  assert.deepEqual(ids(filterMenu(menuCategories, "all", "KOREAN BBQ")), [
    "seoul-mate",
  ]);
  assert.deepEqual(ids(filterMenu(menuCategories, "all", "الآيس كَرِيم")), [
    "milk-cake",
    "its-a-date",
    "ice-cream",
  ]);
});

test("category filtering narrows results and multiword search requires every term", () => {
  assert.deepEqual(ids(filterMenu(menuCategories, "beef", "house")), [
    "house-burger",
  ]);
  assert.deepEqual(ids(filterMenu(menuCategories, "all", "loaded chicken")), [
    "loaded-fries-chicken",
  ]);
  assert.deepEqual(filterMenu(menuCategories, "beef", "water"), []);
  assert.deepEqual(filterMenu(menuCategories, "all", "not-a-dish"), []);
  assert.equal(menuItemCount(filterMenu(menuCategories, "all", "   ")), 42);
});

test("Arabic search tolerates diacritics and common letter variations", () => {
  assert.equal(normalizeMenuText("  إِضَافَة  "), normalizeMenuText("اضافه"));
  assert.equal(normalizeMenuText("آيس كـريم"), normalizeMenuText("ايس كريم"));
});

test("both smash burgers have independent double, triple and quadruple choices", () => {
  const burgers = filterMenu(menuCategories, "beef", "smash")[0].items;
  assert.equal(burgers.length, 2);
  for (const item of burgers)
    assert.deepEqual(
      item.options.map((option) => option.id),
      ["double", "triple", "quadruple"],
    );
  assert.notEqual(burgers[0].options, burgers[1].options);
});

test("unknown prices stay absent while approved numeric prices retain their value", () => {
  assert.equal(formatMenuPrice(null), null);
  assert.equal(formatMenuPrice(undefined, "ar"), null);
  assert.match(formatMenuPrice(0), /0/);
  assert.match(formatMenuPrice(39.5), /39\.50/);
  assert.match(formatMenuPrice(39.5), /SAR/);
  assert.match(formatMenuPrice(39.5, "ar"), /SAR/);
});

test("dish details use the selected option's price and never substitute a different option's price", () => {
  const item = {
    price: 99,
    options: [
      { id: "double", price: 30 },
      { id: "triple", price: null },
    ],
  };
  assert.equal(menuItemPrice(item, "double"), 30);
  assert.equal(menuItemPrice(item, "triple"), null);
  assert.equal(menuItemPrice(item), 30);
  assert.equal(menuItemPrice({ price: 0 }), 0);
});
