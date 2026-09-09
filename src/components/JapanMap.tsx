"use client";

import { DeformedJapanMap } from "./maps/DeformedJapanMap";
import { GeographicJapanMap } from "./maps/GeographicJapanMap";
import type { JapanMapViewProps } from "./maps/types";
import { SegmentedControl } from "./SegmentedControl";
import { MAP_ATTRIBUTIONS, type MapStyle } from "../lib/map-style";

type JapanMapProps = JapanMapViewProps & {
  mapStyle: MapStyle;
  onMapStyleChange: (style: MapStyle) => void;
  selectHint: string;
};

export function JapanMap({
  mapStyle,
  onMapStyleChange,
  selectHint,
  mapLabel,
  ...viewProps
}: JapanMapProps) {
  const styleHint =
    mapStyle === "geographic"
      ? "実際の形に近い日本地図です。"
      : "比較しやすいデフォルメ地図です。";

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {styleHint} {selectHint}
        </p>
        <SegmentedControl
          value={mapStyle}
          onChange={onMapStyleChange}
          ariaLabel="地図の種類"
          options={[
            { value: "geographic", label: "実地図" },
            { value: "deformed", label: "デフォルメ" },
          ]}
        />
      </div>
      {mapStyle === "geographic" ? (
        <GeographicJapanMap mapLabel={mapLabel} {...viewProps} />
      ) : (
        <DeformedJapanMap mapLabel={mapLabel} {...viewProps} />
      )}
      <p className="mt-3 text-xs text-slate-500">
        出典:{" "}
        <a
          href={MAP_ATTRIBUTIONS[mapStyle].href}
          className="underline decoration-slate-300 underline-offset-2 hover:text-slate-700"
          rel="noreferrer"
          target="_blank"
        >
          {MAP_ATTRIBUTIONS[mapStyle].label}
        </a>
        （{MAP_ATTRIBUTIONS[mapStyle].license}）
      </p>
    </div>
  );
}
