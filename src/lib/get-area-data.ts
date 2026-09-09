import { aggregateMunicipalityRecords } from "./aggregate-areas";
import {
  areaDataCacheKey,
  resolveAreaDataOptions,
  type AreaDataOptions,
} from "./area-data-options";
import { MUNICIPALITIES, municipalitiesInPref } from "./municipality-catalog";
import { getMockAreaRecords } from "./mock-data";
import { parseSheetRows } from "./parse-sheet";
import { PREFECTURES } from "./prefectures";
import { fetchSheetRows } from "./sheets";
import type { AreaDataset, AreaRecord } from "./types";

type CacheEntry = {
  expiresAt: number;
  data: AreaDataset;
};

const memoryCache = new Map<string, CacheEntry>();

function emptyPrefecture(code: string, name: string): AreaRecord {
  return {
    code,
    level: "prefecture",
    prefCode: code,
    name,
    status: "unknown",
    value: null,
    description: "",
    sourceUrl: null,
    updatedAt: null,
  };
}

function emptyMunicipality(
  code: string,
  prefCode: string,
  name: string,
): AreaRecord {
  return {
    code,
    level: "municipality",
    prefCode,
    name,
    status: "unknown",
    value: null,
    description: "",
    sourceUrl: null,
    updatedAt: null,
  };
}

function buildDataset(
  records: AreaRecord[],
  meta: Pick<AreaDataset, "source" | "error" | "warnings">,
): AreaDataset {
  const prefRows = new Map<string, AreaRecord>();
  const muniRows = new Map<string, AreaRecord>();

  for (const record of records) {
    if (record.level === "prefecture") prefRows.set(record.code, record);
    else muniRows.set(record.code, record);
  }

  const municipalities: Record<string, AreaRecord> = {};
  for (const metaItem of MUNICIPALITIES) {
    const row = muniRows.get(metaItem.code);
    municipalities[metaItem.code] = row
      ? {
          ...row,
          name: row.name || metaItem.name,
          prefCode: metaItem.prefCode,
        }
      : emptyMunicipality(metaItem.code, metaItem.prefCode, metaItem.name);
  }

  const extraMuniCodes: string[] = [];
  for (const [code, row] of muniRows) {
    if (municipalities[code]) continue;
    municipalities[code] = row;
    extraMuniCodes.push(code);
  }

  const prefectures: Record<string, AreaRecord> = {};
  for (const pref of PREFECTURES) {
    const explicit = prefRows.get(pref.code);
    if (explicit) {
      prefectures[pref.code] = {
        ...explicit,
        name: explicit.name || pref.name,
      };
      continue;
    }

    const childCodes = municipalitiesInPref(pref.code).map((item) => item.code);
    for (const code of extraMuniCodes) {
      if (municipalities[code]?.prefCode === pref.code) childCodes.push(code);
    }
    const children = childCodes.map((code) => municipalities[code]);
    prefectures[pref.code] =
      children.length > 0
        ? aggregateMunicipalityRecords(pref, children)
        : emptyPrefecture(pref.code, pref.name);
  }

  const warnings = [...meta.warnings];
  if (extraMuniCodes.length > 0) {
    warnings.push(
      `地図マスタにない市区町村コードを ${extraMuniCodes.length} 件読みました。一覧には出ますが、地図には描かれない場合があります。`,
    );
  }

  return {
    prefectures,
    municipalities,
    source: meta.source,
    fetchedAt: new Date().toISOString(),
    error: meta.error,
    warnings,
  };
}

function toUserError(error: unknown): string {
  if (error instanceof Error && error.message.includes("環境変数")) {
    return "Google Sheets の接続設定が完了していません。環境変数を確認してください。";
  }
  return "Google Sheets からデータを取得できませんでした。時間をおいて再度お試しください。";
}

async function loadAreaData(options: AreaDataOptions): Promise<AreaDataset> {
  const resolved = resolveAreaDataOptions(options);

  if (resolved.useMockData) {
    return buildDataset(getMockAreaRecords(), {
      source: "mock",
      error: null,
      warnings: ["モックデータを表示しています。"],
    });
  }

  try {
    const rows = await fetchSheetRows(options);
    const parsed = parseSheetRows(rows);
    return buildDataset(parsed.records, {
      source: "sheets",
      error: null,
      warnings: parsed.warnings,
    });
  } catch (error) {
    return buildDataset([], {
      source: "sheets",
      error: toUserError(error),
      warnings: [],
    });
  }
}

export async function getAreaData(
  options: AreaDataOptions = {},
): Promise<AreaDataset> {
  const cacheKey = areaDataCacheKey(options);
  const now = Date.now();
  const cached = memoryCache.get(cacheKey);
  if (cached && now < cached.expiresAt) {
    return cached.data;
  }

  const data = await loadAreaData(options);
  const resolved = resolveAreaDataOptions(options);
  const ttlMs = data.error ? 30_000 : resolved.cacheSeconds * 1000;

  memoryCache.set(cacheKey, {
    data,
    expiresAt: now + ttlMs,
  });

  return data;
}

export async function getMunicipalitiesForPref(
  prefCode: string,
  options: AreaDataOptions = {},
): Promise<AreaRecord[]> {
  const data = await getAreaData(options);
  const known = municipalitiesInPref(prefCode)
    .map((item) => data.municipalities[item.code])
    .filter((row): row is AreaRecord => Boolean(row));
  const knownCodes = new Set(known.map((row) => row.code));
  const extras = Object.values(data.municipalities).filter(
    (row) => row.prefCode === prefCode && !knownCodes.has(row.code),
  );
  return [...known, ...extras].sort((a, b) =>
    a.code.localeCompare(b.code, "en"),
  );
}
