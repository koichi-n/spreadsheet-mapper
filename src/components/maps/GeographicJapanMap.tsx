"use client";

import { useState } from "react";
import japanMap from "@svg-maps/japan";
import { MapTooltip, pointerPosition } from "@/components/maps/MapTooltip";
import type { JapanMapViewProps } from "@/components/maps/types";
import { SVG_MAP_ID_TO_PREF_CODE } from "@/lib/map-style";
import { getPrefectureColors, getStatusConfig } from "@/lib/status-config";

const GEO_LOCATIONS = japanMap.locations.flatMap((location) => {
  const prefCode = SVG_MAP_ID_TO_PREF_CODE[location.id];
  if (!prefCode) return [];
  return [{ ...location, prefCode }];
});

if (GEO_LOCATIONS.length !== 47) {
  throw new Error(
    `Expected 47 geographic prefecture paths, got ${GEO_LOCATIONS.length}`,
  );
}

export function GeographicJapanMap({
  prefectures,
  selectedCode,
  onSelect,
}: JapanMapViewProps) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(
    null,
  );
  const hovered = hoveredCode ? prefectures[hoveredCode] : null;

  return (
    <div
      className="relative"
      onMouseLeave={() => {
        setHoveredCode(null);
        setTooltip(null);
      }}
    >
      <svg
        viewBox={japanMap.viewBox}
        role="group"
        aria-label="日本地図。各都道府県を選択できます"
        className="mx-auto h-auto w-full max-w-xl"
      >
        <rect
          x={0}
          y={0}
          width="438"
          height="516"
          fill="#EEF3F7"
          rx={8}
          pointerEvents="none"
        />
        {GEO_LOCATIONS.map((location) => {
          const record = prefectures[location.prefCode];
          if (!record) return null;
          const colors = getPrefectureColors(record);
          const status = getStatusConfig(record.status);
          const isSelected = selectedCode === location.prefCode;
          const valueText =
            record.value === null ? "数値なし" : `数値 ${record.value}`;

          return (
            <path
              key={location.prefCode}
              className="pref-shape pref-shape-geo cursor-pointer hover:brightness-95"
              data-pref-code={location.prefCode}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${record.prefecture}、ステータス ${status.label}、${valueText}`}
              d={location.path}
              fill={colors.fill}
              stroke={isSelected ? "#0F172A" : "#FFFFFF"}
              strokeWidth={isSelected ? 1.4 : 0.45}
              strokeLinejoin="round"
              onClick={() => onSelect(location.prefCode)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(location.prefCode);
                }
              }}
              onMouseEnter={(event) => {
                setHoveredCode(location.prefCode);
                setTooltip(pointerPosition(event));
              }}
              onMouseMove={(event) => setTooltip(pointerPosition(event))}
              onFocus={() => setHoveredCode(location.prefCode)}
              onBlur={() =>
                setHoveredCode((current) =>
                  current === location.prefCode ? null : current,
                )
              }
            />
          );
        })}
      </svg>
      <MapTooltip record={hovered ?? null} position={tooltip} />
    </div>
  );
}
