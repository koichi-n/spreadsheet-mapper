"use client";

import { useMemo, useState } from "react";
import { JapanMap } from "@/components/JapanMap";
import { MapLegend } from "@/components/MapLegend";
import { PrefectureDetail } from "@/components/PrefectureDetail";
import { PrefectureList } from "@/components/PrefectureList";
import { APP_CONFIG } from "@/lib/app-config";
import { MAP_STYLE, type MapStyle } from "@/lib/map-style";
import { PREFECTURES } from "@/lib/prefectures";
import type { PrefectureDataset, PrefectureRecord } from "@/lib/types";

type MapAppProps = {
  data: PrefectureDataset;
};

export function MapApp({ data }: MapAppProps) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyle>(MAP_STYLE);

  const selected = selectedCode ? data.prefectures[selectedCode] : null;

  const records = useMemo(
    () =>
      PREFECTURES.map((pref) => data.prefectures[pref.code]).filter(
        (row): row is PrefectureRecord => Boolean(row),
      ),
    [data.prefectures],
  );

  function handleSelect(code: string) {
    setSelectedCode(code);
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document.getElementById("prefecture-detail")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <p className="text-sm font-medium tracking-wide text-sky-800">
          Spreadsheet Mapper
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {APP_CONFIG.title}
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          {APP_CONFIG.description}
        </p>
      </header>

      <DataBanner data={data} />

      <a
        href="#prefecture-list"
        className="sr-only focus:not-sr-only focus:mb-4 focus:inline-block focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        地図をスキップして都道府県一覧へ
      </a>

      <section
        aria-label="日本地図"
        className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/80 sm:p-5"
      >
        <JapanMap
          prefectures={data.prefectures}
          selectedCode={selectedCode}
          onSelect={handleSelect}
          mapStyle={mapStyle}
          onMapStyleChange={setMapStyle}
        />
      </section>

      <MapLegend className="mt-6" />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
        <PrefectureDetail record={selected} />
        <PrefectureList
          records={records}
          selectedCode={selectedCode}
          onSelect={handleSelect}
        />
      </div>

      <footer className="mt-12 space-y-1 text-xs leading-5 text-slate-500">
        {data.fetchedAt ? (
          <p>
            データ取得: {data.fetchedAt.slice(0, 19).replace("T", " ")}
            {data.source === "mock" ? " / モック" : " / Google Sheets"}
          </p>
        ) : null}
      </footer>
    </div>
  );
}

function DataBanner({ data }: { data: PrefectureDataset }) {
  if (!data.error && data.warnings.length === 0) return null;

  const isError = Boolean(data.error);

  return (
    <div
      className={`mb-6 rounded-xl px-4 py-3 text-sm ${
        isError
          ? "bg-red-50 text-red-900 ring-1 ring-red-100"
          : "bg-amber-50 text-amber-950 ring-1 ring-amber-100"
      }`}
      role={isError ? "alert" : "status"}
    >
      {data.error ? <p>{data.error}</p> : null}
      {data.warnings.map((warning) => (
        <p key={warning}>{warning}</p>
      ))}
    </div>
  );
}
