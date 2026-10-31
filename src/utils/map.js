const TILE_SIZE = 256;

// Web Mercator coordinates, in pixels at the selected zoom.
// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
export function projectLocation({ latitude, longitude }, zoom) {
  const radians =
    (Math.max(-85.05112878, Math.min(85.05112878, latitude)) * Math.PI) / 180;
  const worldSize = TILE_SIZE * 2 ** zoom;
  return {
    x: ((longitude + 180) / 360) * worldSize,
    y: ((1 - Math.asinh(Math.tan(radians)) / Math.PI) / 2) * worldSize,
  };
}

// Request only tiles intersecting the visible preview. Native browser caching
// and the default referrer policy are retained; no offline/prefetch requests.
export function getVisibleMapTiles(coordinates, zoom, width, height) {
  if (width <= 0 || height <= 0) return [];
  const center = projectLocation(coordinates, zoom);
  const left = center.x - width / 2;
  const top = center.y - height / 2;
  const tiles = [];
  const count = 2 ** zoom;
  for (
    let y = Math.floor(top / TILE_SIZE);
    y < Math.ceil((top + height) / TILE_SIZE);
    y++
  ) {
    if (y < 0 || y >= count) continue;
    for (
      let x = Math.floor(left / TILE_SIZE);
      x < Math.ceil((left + width) / TILE_SIZE);
      x++
    ) {
      tiles.push({
        x: ((x % count) + count) % count,
        y,
        left: x * TILE_SIZE - left,
        top: y * TILE_SIZE - top,
      });
    }
  }
  return tiles;
}
