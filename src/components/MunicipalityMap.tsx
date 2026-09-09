"use client";

import { useEffect, useRef, useState } from "react";
import { MapTooltip, pointerPosition } from "./maps/MapTooltip";
import {
  loadMunicipalityMap,
  strokeForViewBox,
  type MunicipalityMapData,
  type MunicipalityMapLocation,
} from "../lib/load-municipality-map";
import { getAreaColors, getStatusConfig } from "../lib/status-config";
import type { AreaRecord } from "../lib/types";

type MunicipalityMapProps = {
  prefCode: string;
  prefName: string;
  municipalities: Record<string, AreaRecord>;
  selectedCode: string | null;
  onSelect: (code: string) => void;
  mapBasePath?: string;
};

export function MunicipalityMap({
  prefCode,
  prefName,
  municipalities,
  selectedCode,
  onSelect,
  mapBasePath,
}: MunicipalityMapProps) {
  const [map, setMap] = useState<MunicipalityMapData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    loadMunicipalityMap(prefCode, mapBasePath)
      .then((data) => {
        if (!cancelled) {
          setMap(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("市区町村の地図データを読み込めませんでした。一覧から選択できます。");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [prefCode, mapBasePath]);

  const hovered = hoveredCode ? municipalities[hoveredCode] : null;

  if (error) {
    return (
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950 ring-1 ring-amber-100">
        {error}
      </p>
    );
  }

  if (!map) {
    return (
      <div
        className="flex h-72 items-center justify-center text-sm text-slate-500"
        role="status"
      >
        市区町村地図を読み込み中…
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseLeave={() => {
        setHoveredCode(null);
        setTooltip(null);
      }}
    >
      <MunicipalitySvg
        viewBox={map.viewBox}
        locations={map.locations}
        municipalities={municipalities}
        selectedCode={selectedCode}
        label={`${prefName}の市区町村地図。各市区町村を選択できます`}
        rootRef={rootRef}
        onSelect={onSelect}
        onHover={(code, position) => {
          setHoveredCode(code);
          setTooltip(position);
        }}
      />
      {map.inset ? (
        <div className="absolute bottom-2 left-2 w-[38%] max-w-[13rem] rounded-lg bg-white/95 p-1.5 shadow-sm ring-1 ring-slate-200">
          <p className="px-0.5 pb-1 text-[10px] font-medium tracking-wide text-slate-500">
            離島
          </p>
          <MunicipalitySvg
            viewBox={map.inset.viewBox}
            locations={map.inset.locations}
            municipalities={municipalities}
            selectedCode={selectedCode}
            label={`${prefName}の離島`}
            compact
            rootRef={rootRef}
            onSelect={onSelect}
            onHover={(code, position) => {
              setHoveredCode(code);
              setTooltip(position);
            }}
          />
        </div>
      ) : null}
      <MapTooltip record={hovered ?? null} position={tooltip} />
    </div>
  );
}

function MunicipalitySvg({
  viewBox,
  locations,
  municipalities,
  selectedCode,
  label,
  compact = false,
  rootRef,
  onSelect,
  onHover,
}: {
  viewBox: string;
  locations: MunicipalityMapLocation[];
  municipalities: Record<string, AreaRecord>;
  selectedCode: string | null;
  label: string;
  compact?: boolean;
  rootRef: { current: HTMLDivElement | null };
  onSelect: (code: string) => void;
  onHover: (code: string | null, position: { x: number; y: number } | null) => void;
}) {
  return (
    <svg
      viewBox={viewBox}
      role="group"
      aria-label={label}
      className={`mx-auto h-auto w-full ${compact ? "" : "max-w-3xl"}`}
    >
      {locations.map((location) => {
        const record = municipalities[location.code];
        const name = record?.name || location.name;
        const status = getStatusConfig(record?.status ?? "unknown");
        const colors = record
          ? getAreaColors(record)
          : { fill: status.fill, text: status.text };
        const isSelected = selectedCode === location.code;
        const valueText =
          record?.value == null ? "数値なし" : `数値 ${record.value}`;

        return (
          <path
            key={location.code}
            className="muni-shape cursor-pointer hover:brightness-95"
            data-muni-code={location.code}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`${name}、ステータス ${status.label}、${valueText}`}
            d={location.path}
            fill={colors.fill}
            stroke={isSelected ? "#0F172A" : "#FFFFFF"}
            strokeWidth={strokeForViewBox(viewBox, isSelected)}
            strokeLinejoin="round"
            onClick={() => onSelect(location.code)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(location.code);
              }
            }}
            onMouseEnter={(event) => {
              onHover(location.code, pointerPosition(event, rootRef.current));
            }}
            onMouseMove={(event) => {
              onHover(location.code, pointerPosition(event, rootRef.current));
            }}
            onFocus={() => onHover(location.code, null)}
            onBlur={() => onHover(null, null)}
          />
        );
      })}
    </svg>
  );
}
