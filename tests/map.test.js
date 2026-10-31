import test from "node:test";
import assert from "node:assert/strict";
import { getVisibleMapTiles, projectLocation } from "../src/utils/map.js";
import { getDirectionsUrl, site } from "../src/data/site.js";

test("the map and Google Maps directions point to the same owner-supplied coordinates", () => {
  const pin = new URL(getDirectionsUrl()).searchParams
    .get("q")
    .split(",")
    .map(Number);
  assert.deepEqual(pin, [
    site.coordinates.latitude,
    site.coordinates.longitude,
  ]);
});

test("map projection matches the published OpenStreetMap Hachiko reference example", () => {
  const projected = projectLocation(
    { latitude: 35.6590699, longitude: 139.7006793 },
    18,
  );
  assert.ok(Math.abs(projected.x / 256 - 232798.930207) < 0.000001);
  // The reference table rounds intermediate Mercator values.
  assert.ok(Math.abs(projected.y / 256 - 103246.410442) < 0.00001);
});

test("desktop and mobile previews keep the correct geographic point at the marker tip without gaps", () => {
  for (const [width, height] of [
    [665, 680],
    [348, 398],
    [280, 398],
  ]) {
    const tiles = getVisibleMapTiles(
      site.coordinates,
      site.map.zoom,
      width,
      height,
    );
    const center = projectLocation(site.coordinates, site.map.zoom);
    for (const [x, y] of [
      [0, 0],
      [width / 2, height / 2],
      [width - 1, height - 1],
    ]) {
      const tile = tiles.find(
        (t) => t.left <= x && t.left + 256 > x && t.top <= y && t.top + 256 > y,
      );
      assert.ok(
        tile,
        `Missing map coverage at ${x},${y} in ${width}x${height}`,
      );
      assert.ok(
        Math.abs(tile.x * 256 + x - tile.left - (center.x + x - width / 2)) <
          0.000001,
      );
      assert.ok(
        Math.abs(tile.y * 256 + y - tile.top - (center.y + y - height / 2)) <
          0.000001,
      );
    }
    assert.ok(
      tiles.every(
        (t) =>
          t.left < width &&
          t.top < height &&
          t.left + 256 > 0 &&
          t.top + 256 > 0,
      ),
    );
  }
  assert.deepEqual(
    getVisibleMapTiles(site.coordinates, site.map.zoom, 0, 0),
    [],
  );
});
