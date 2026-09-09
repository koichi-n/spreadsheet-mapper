"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AreaDetail } from "./AreaDetail";
import { AreaList } from "./AreaList";
import { JapanMap } from "./JapanMap";
import { MapLegend } from "./MapLegend";
import { MunicipalityMap } from "./MunicipalityMap";
import { SegmentedControl } from "./SegmentedControl";
import { APP_CONFIG } from "../lib/app-config";
import {
  DEFAULT_MUNICIPALITY_MAP_BASE_PATH,
} from "../lib/load-municipality-map";
import {
  MAP_ATTRIBUTIONS,
  MAP_STYLE,
  MUNICIPALITY_MAP_ATTRIBUTION,
  type MapStyle,
} from "../lib/map-style";
import { PREFECTURES } from "../lib/prefectures";
import type { AreaLevel, AreaRecord, DataSource } from "../lib/types";

export type MapAppProps = {
  prefectures: Record<string, AreaRecord>;
  source: DataSource;
  fetchedAt: string;
  error: string | null;
  warnings: string[];
  title?: string;
  description?: string;
  /** デモ用のページ見出し。団体サイトへ埋め込むときは false */
  showHeader?: boolean;
  className?: string;
  /**
   * 市区町村 API。`{prefCode}` を置換する。
   * Server Component からは関数ではなくこちらを渡す。
   * 既定は `/api/municipalities/{prefCode}`
   */
  municipalitiesPathTemplate?: string;
  /** クライアントから直接渡す場合の上書き */
  loadMunicipalities?: (prefCode: string) => Promise<AreaRecord[]>;
  municipalityMapBasePath?: string;
};

const GRANULARITY_OPTIONS = [
  { value: "prefecture", label: "都道府県" },
  { value: "municipality", label: "市区町村" },
] as const;

export function MapApp({
  prefectures,
  source,
  fetchedAt,
  error,
  warnings,
  title = APP_CONFIG.title,
  description = APP_CONFIG.description,
  showHeader = true,
  className,
  municipalitiesPathTemplate = "/api/municipalities/{prefCode}",
  loadMunicipalities,
  municipalityMapBasePath = DEFAULT_MUNICIPALITY_MAP_BASE_PATH,
}: MapAppProps) {
  const [granularity, setGranularity] = useState<AreaLevel>("prefecture");
  const [selectedPrefCode, setSelectedPrefCode] = useState<string | null>(null);
  const [selectedMuniCode, setSelectedMuniCode] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyle>(MAP_STYLE);
  const [muniRecords, setMuniRecords] = useState<AreaRecord[]>([]);
  const [muniError, setMuniError] = useState<string | null>(null);
  const loadMunicipalitiesRef = useRef(loadMunicipalities);
  loadMunicipalitiesRef.current = loadMunicipalities;
  const municipalitiesPathTemplateRef = useRef(municipalitiesPathTemplate);
  municipalitiesPathTemplateRef.current = municipalitiesPathTemplate;

  const showMunicipalityMap =
    granularity === "municipality" && selectedPrefCode !== null;

  const prefRecords = useMemo(
    () =>
      PREFECTURES.map((pref) => prefectures[pref.code]).filter(
        (row): row is AreaRecord => Boolean(row),
      ),
    [prefectures],
  );

  const activePref = selectedPrefCode
    ? (prefectures[selectedPrefCode] ?? null)
    : null;

  const muniByCode = useMemo(() => {
    const byCode: Record<string, AreaRecord> = {};
    for (const record of muniRecords) {
      byCode[record.code] = record;
    }
    return byCode;
  }, [muniRecords]);

  const selected = showMunicipalityMap
    ? selectedMuniCode
      ? (muniByCode[selectedMuniCode] ?? null)
      : activePref
    : activePref;

  useEffect(() => {
    if (!selectedPrefCode || granularity !== "municipality") return;

    let cancelled = false;
    const load =
      loadMunicipalitiesRef.current ??
      ((code: string) =>
        defaultLoadMunicipalities(
          code,
          municipalitiesPathTemplateRef.current,
        ));
    load(selectedPrefCode)
      .then((records) => {
        if (cancelled) return;
        setMuniRecords(records);
        setMuniError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setMuniError("市区町村データを読み込めませんでした。");
        setMuniRecords([]);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedPrefCode, granularity]);

  useEffect(() => {
    if (!showMunicipalityMap) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      zoomOutToJapan();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showMunicipalityMap]);

  function zoomOutToJapan() {
    setSelectedPrefCode(null);
    setSelectedMuniCode(null);
    setMuniRecords([]);
    setMuniError(null);
  }

  function changeGranularity(next: AreaLevel) {
    setGranularity(next);
    if (next === "prefecture") {
      setSelectedMuniCode(null);
    }
  }

  function selectPrefecture(code: string) {
    setSelectedPrefCode(code);
    setSelectedMuniCode(null);
    if (granularity === "prefecture") {
      scrollDetailIntoView();
    }
  }

  function openMunicipalities(code: string) {
    setSelectedPrefCode(code);
    setSelectedMuniCode(null);
    setGranularity("municipality");
  }

  function selectMunicipality(code: string) {
    setSelectedMuniCode(code);
    scrollDetailIntoView();
  }

  const attribution = showMunicipalityMap
    ? MUNICIPALITY_MAP_ATTRIBUTION
    : MAP_ATTRIBUTIONS[mapStyle];

  const listIsMunicipalities = showMunicipalityMap;
  const japanMapHint =
    granularity === "municipality"
      ? "市区町村を見る都道府県を選んでください。"
      : "都道府県を選ぶと、その詳細を表示します。";
  const japanMapLabel =
    granularity === "municipality"
      ? "日本地図。市区町村を見る都道府県を選べます"
      : "日本地図。各都道府県を選ぶと詳細を表示します";

  return (
    <div
      className={
        className ??
        (showHeader
          ? "mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
          : undefined)
      }
    >
      {showHeader ? (
      <header className="mb-8 max-w-3xl">
        <p className="text-sm font-medium tracking-wide text-sky-800">
          Spreadsheet Mapper
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          {description}
        </p>
      </header>
      ) : null}

      <DataBanner
        error={error}
        warnings={warnings}
        extra={granularity === "municipality" ? muniError : null}
      />

      <a
        href="#area-list"
        className="sr-only focus:not-sr-only focus:mb-4 focus:inline-block focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        地図をスキップして一覧へ
      </a>

      <section
        aria-label={showMunicipalityMap ? "市区町村地図" : "日本地図"}
        className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/80 sm:p-5"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-slate-500">
              表示単位
            </p>
            <p className="mt-0.5 text-sm text-slate-600">
              {granularity === "prefecture"
                ? "全国を都道府県で比較します。"
                : showMunicipalityMap
                  ? `${activePref?.name ?? ""}の市区町村に絞り込んでいます。`
                  : "市区町村を見る都道府県を選んでください。"}
            </p>
          </div>
          <SegmentedControl
            value={granularity}
            onChange={changeGranularity}
            ariaLabel="表示単位"
            options={GRANULARITY_OPTIONS}
          />
        </div>

        {granularity === "municipality" && selectedPrefCode && activePref ? (
          <div className="mb-3">
            <p className="text-xs text-slate-500">
              <button
                type="button"
                onClick={zoomOutToJapan}
                className="underline decoration-slate-300 underline-offset-2 hover:text-slate-700"
              >
                日本
              </button>
              {" / "}
              {activePref.name}
            </p>
            <h2 className="text-lg font-semibold text-slate-900">
              {activePref.name}の市区町村
            </h2>
          </div>
        ) : null}

        {granularity === "municipality" && selectedPrefCode ? (
          <MunicipalityMap
            key={selectedPrefCode}
            prefCode={selectedPrefCode}
            prefName={activePref?.name ?? ""}
            municipalities={muniByCode}
            selectedCode={selectedMuniCode}
            onSelect={selectMunicipality}
            mapBasePath={municipalityMapBasePath}
          />
        ) : (
          <JapanMap
            prefectures={prefectures}
            selectedCode={selectedPrefCode}
            onSelect={selectPrefecture}
            mapStyle={mapStyle}
            onMapStyleChange={setMapStyle}
            selectHint={japanMapHint}
            mapLabel={japanMapLabel}
          />
        )}

        {showMunicipalityMap ? (
          <p className="mt-3 text-xs text-slate-500">
            出典:{" "}
            <a
              href={attribution.href}
              className="underline decoration-slate-300 underline-offset-2 hover:text-slate-700"
              rel="noreferrer"
              target="_blank"
            >
              {attribution.label}
            </a>
            （{attribution.license}）
          </p>
        ) : null}
      </section>

      <MapLegend className="mt-6" />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
        <AreaDetail
          record={selected}
          heading={
            selected?.level === "municipality"
              ? "選択した市区町村の詳細"
              : "選択した都道府県の詳細"
          }
          emptyText={
            granularity === "municipality" && !selectedPrefCode
              ? "市区町村を見る都道府県を、地図または一覧から選んでください。"
              : "地図または一覧から都道府県を選ぶと、ここに詳細が表示されます。"
          }
          action={
            granularity === "prefecture" && activePref ? (
              <button
                type="button"
                onClick={() => openMunicipalities(activePref.code)}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                {activePref.name}の市区町村を見る
              </button>
            ) : undefined
          }
        />
        <AreaList
          key={listIsMunicipalities ? selectedPrefCode : "prefecture"}
          records={listIsMunicipalities ? muniRecords : prefRecords}
          selectedCode={
            listIsMunicipalities ? selectedMuniCode : selectedPrefCode
          }
          onSelect={
            listIsMunicipalities ? selectMunicipality : selectPrefecture
          }
          heading={listIsMunicipalities ? "市区町村一覧" : "都道府県一覧"}
          description={
            listIsMunicipalities
              ? "地図の代わりに、ここから市区町村を選べます。"
              : granularity === "municipality"
                ? "市区町村地図を開く都道府県を選べます。"
                : "地図の代わりに、ここから都道府県を選べます。"
          }
          searchable={listIsMunicipalities}
        />
      </div>

      <footer className="mt-12 space-y-1 text-xs leading-5 text-slate-500">
        {fetchedAt ? (
          <p>
            データ取得: {fetchedAt.slice(0, 19).replace("T", " ")}
            {source === "mock" ? " / モック" : " / Google Sheets"}
          </p>
        ) : null}
      </footer>
    </div>
  );
}

function defaultLoadMunicipalities(
  prefCode: string,
  pathTemplate: string,
): Promise<AreaRecord[]> {
  const path = pathTemplate.replaceAll(
    "{prefCode}",
    encodeURIComponent(prefCode),
  );
  return fetch(path).then(async (response) => {
    if (!response.ok) {
      throw new Error("failed to load municipalities");
    }
    const json = (await response.json()) as { records: AreaRecord[] };
    return json.records;
  });
}

function scrollDetailIntoView() {
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  if (!isMobile) return;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  document.getElementById("area-detail")?.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "nearest",
  });
}

function DataBanner({
  error,
  warnings,
  extra,
}: {
  error: string | null;
  warnings: string[];
  extra: string | null;
}) {
  if (!error && warnings.length === 0 && !extra) return null;

  const isError = Boolean(error || extra);

  return (
    <div
      className={`mb-6 rounded-xl px-4 py-3 text-sm ${
        isError
          ? "bg-red-50 text-red-900 ring-1 ring-red-100"
          : "bg-amber-50 text-amber-950 ring-1 ring-amber-100"
      }`}
      role={isError ? "alert" : "status"}
    >
      {error ? <p>{error}</p> : null}
      {extra ? <p>{extra}</p> : null}
      {warnings.map((warning) => (
        <p key={warning}>{warning}</p>
      ))}
    </div>
  );
}
