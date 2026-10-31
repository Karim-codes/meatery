import React, { useEffect, useRef, useState } from "react";
import { Arrow } from "./Icons";
import { BrandMark } from "./BrandMark";
import { getDirectionsUrl, site } from "../data/site";
import { getVisibleMapTiles } from "../utils/map";

export function LocationMap({ copy }) {
  const panel = useRef(null);
  const [visible, setVisible] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = panel.current;
    const resize = new ResizeObserver(([entry]) => {
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    resize.observe(element);
    const intersection = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        intersection.disconnect();
      }
    });
    intersection.observe(element);
    return () => {
      resize.disconnect();
      intersection.disconnect();
    };
  }, []);

  const tiles =
    visible && !failed
      ? getVisibleMapTiles(
          site.coordinates,
          site.map.zoom,
          size.width,
          size.height,
        )
      : [];

  return (
    <div className="location-map">
      <a
        ref={panel}
        className="map-panel"
        href={getDirectionsUrl()}
        target="_blank"
        rel="noreferrer"
        aria-label={copy.mapLabel}
      >
        <div className="map-tiles" aria-hidden="true" dir="ltr">
          {tiles.map((tile) => (
            <img
              key={`${tile.x}/${tile.y}`}
              src={site.map.tileUrl
                .replace("{z}", site.map.zoom)
                .replace("{x}", tile.x)
                .replace("{y}", tile.y)}
              width="256"
              height="256"
              alt=""
              decoding="async"
              draggable="false"
              style={{ left: tile.left, top: tile.top }}
              onError={() => setFailed(true)}
            />
          ))}
        </div>
        <div className="map-center" aria-hidden="true">
          <div className="map-pin">
            <svg
              className="map-pin-outline"
              viewBox="0 0 72 92"
              fill="none"
              focusable="false"
            >
              <path
                d="M36 86C28 75 5 56 5 36a31 31 0 0 1 62 0c0 20-23 39-31 50Z"
                fill="#f4f0e7"
                stroke="#94816a"
                strokeWidth="1.25"
                strokeLinejoin="round"
              />
            </svg>
            <BrandMark className="map-pin-brand" />
          </div>
          <div className="map-place-card">
            <span dir="ltr">MEATERY</span>
            <small>{copy.mapStatus}</small>
          </div>
        </div>
        <span className="map-status">
          {failed ? copy.mapUnavailable : copy.mapHeading}
        </span>
        <span className="map-coordinates" dir="ltr">
          {site.coordinates.latitude.toFixed(6)},{" "}
          {site.coordinates.longitude.toFixed(6)}
        </span>
        <span className="map-caption">
          {copy.mapCaption}
          <Arrow diagonal />
        </span>
      </a>
      <a
        className="map-attribution"
        href={site.map.attributionUrl}
        target="_blank"
        rel="noreferrer"
        dir="ltr"
      >
        {site.map.attribution}
      </a>
    </div>
  );
}
