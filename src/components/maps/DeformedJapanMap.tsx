"use client";

import { useState } from "react";
import { MapTooltip, pointerPosition } from "@/components/maps/MapTooltip";
import type { JapanMapViewProps } from "@/components/maps/types";
import { MAP_VIEWBOX, OKINAWA_BRACKET_POINTS, PREFECTURE_SHAPES } from "@/lib/map-geometry";
import { shortPrefectureName } from "@/lib/prefectures";
import { getPrefectureColors, getStatusConfig } from "@/lib/status-config";

export function DeformedJapanMap({
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
        viewBox={`${MAP_VIEWBOX.minX} ${MAP_VIEWBOX.minY} ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
        role="group"
        aria-label="デフォルメ日本地図。各都道府県を選択できます"
        className="h-auto w-full"
      >
        <rect
          x={MAP_VIEWBOX.minX}
          y={MAP_VIEWBOX.minY}
          width={MAP_VIEWBOX.width}
          height={MAP_VIEWBOX.height}
          fill="#EEF3F7"
          rx={6}
          pointerEvents="none"
        />
        <polyline
          points={OKINAWA_BRACKET_POINTS}
          fill="none"
          stroke="#94A3B8"
          strokeWidth={1.2}
          strokeLinejoin="round"
          aria-hidden="true"
        />
        {PREFECTURE_SHAPES.map((shape) => {
          const record = prefectures[shape.prefCode];
          if (!record) return null;
          const colors = getPrefectureColors(record);
          const status = getStatusConfig(record.status);
          const isSelected = selectedCode === shape.prefCode;
          const label = shortPrefectureName(record.prefecture);
          const fontSize = Math.min(
            6.4,
            shape.width / Math.max(label.length * 0.95, 2),
            shape.height * 0.42,
          );
          const valueText =
            record.value === null ? "数値なし" : `数値 ${record.value}`;

          return (
            <g key={shape.prefCode}>
              <rect
                className="pref-shape cursor-pointer hover:brightness-95"
                data-pref-code={shape.prefCode}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`${record.prefecture}、ステータス ${status.label}、${valueText}`}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                rx={Math.min(3.2, shape.width * 0.16, shape.height * 0.16)}
                fill={colors.fill}
                stroke={isSelected ? "#0F172A" : "#FFFFFF"}
                strokeWidth={isSelected ? 2.2 : 0.8}
                onClick={() => onSelect(shape.prefCode)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(shape.prefCode);
                  }
                }}
                onMouseEnter={(event) => {
                  setHoveredCode(shape.prefCode);
                  setTooltip(pointerPosition(event));
                }}
                onMouseMove={(event) => setTooltip(pointerPosition(event))}
                onFocus={() => setHoveredCode(shape.prefCode)}
                onBlur={() =>
                  setHoveredCode((current) =>
                    current === shape.prefCode ? null : current,
                  )
                }
              />
              <text
                x={shape.x + shape.width / 2}
                y={shape.y + shape.height / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={colors.text}
                fontSize={fontSize}
                fontWeight={600}
                className="pointer-events-none select-none"
                aria-hidden="true"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      <MapTooltip record={hovered ?? null} position={tooltip} />
    </div>
  );
}
