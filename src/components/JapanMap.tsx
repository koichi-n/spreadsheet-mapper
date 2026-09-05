"use client";

import type { ReactNode } from "react";
import { DeformedJapanMap } from "@/components/maps/DeformedJapanMap";
import { GeographicJapanMap } from "@/components/maps/GeographicJapanMap";
import type { JapanMapViewProps } from "@/components/maps/types";
import { MAP_ATTRIBUTIONS, type MapStyle } from "@/lib/map-style";

type JapanMapProps = JapanMapViewProps & {
  mapStyle: MapStyle;
  onMapStyleChange: (style: MapStyle) => void;
};

export function JapanMap({
  mapStyle,
  onMapStyleChange,
  ...viewProps
}: JapanMapProps) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {mapStyle === "geographic"
            ? "実際の形に近い日本地図です。小さい都府県は一覧からも選べます。"
            : "比較しやすいデフォルメ地図です。"}
        </p>
        <div
          className="inline-flex rounded-lg bg-slate-100 p-1 text-sm"
          role="group"
          aria-label="地図の種類"
        >
          <StyleButton
            active={mapStyle === "geographic"}
            onClick={() => onMapStyleChange("geographic")}
          >
            実地図
          </StyleButton>
          <StyleButton
            active={mapStyle === "deformed"}
            onClick={() => onMapStyleChange("deformed")}
          >
            デフォルメ
          </StyleButton>
        </div>
      </div>
      {mapStyle === "geographic" ? (
        <GeographicJapanMap {...viewProps} />
      ) : (
        <DeformedJapanMap {...viewProps} />
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

function StyleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md px-3 py-1.5 font-medium transition ${
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}
