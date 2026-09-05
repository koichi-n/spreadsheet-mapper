import { APP_CONFIG } from "@/lib/app-config";
import { getMockPrefectureRecords } from "@/lib/mock-data";
import { parseSheetRows } from "@/lib/parse-sheet";
import { PREFECTURES } from "@/lib/prefectures";
import { fetchSheetRows } from "@/lib/sheets";
import type { PrefectureDataset, PrefectureRecord } from "@/lib/types";

type CacheEntry = {
  expiresAt: number;
  data: PrefectureDataset;
};

let memoryCache: CacheEntry | null = null;

function isMockEnabled(): boolean {
  const value = process.env.USE_MOCK_DATA?.trim().toLowerCase();
  return value === "true" || value === "1";
}

function emptyRecord(code: string, name: string): PrefectureRecord {
  return {
    prefCode: code,
    prefecture: name,
    status: "unknown",
    value: null,
    description: "",
    sourceUrl: null,
    updatedAt: null,
  };
}

function buildDataset(
  records: PrefectureRecord[],
  meta: Pick<PrefectureDataset, "source" | "error" | "warnings">,
): PrefectureDataset {
  const byCode = new Map(records.map((record) => [record.prefCode, record]));
  const prefectures: Record<string, PrefectureRecord> = {};

  for (const pref of PREFECTURES) {
    const row = byCode.get(pref.code);
    prefectures[pref.code] = row
      ? {
          ...row,
          prefecture: row.prefecture || pref.name,
        }
      : emptyRecord(pref.code, pref.name);
  }

  const missingCount = PREFECTURES.filter((pref) => !byCode.has(pref.code)).length;
  const warnings = [...meta.warnings];
  if (missingCount > 0 && meta.source === "sheets" && !meta.error) {
    warnings.push(
      `スプレッドシートに存在しない都道府県が ${missingCount} 件あります。地図上は「情報なし」として表示します。`,
    );
  }

  return {
    prefectures,
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

async function loadPrefectureData(): Promise<PrefectureDataset> {
  if (isMockEnabled()) {
    return buildDataset(getMockPrefectureRecords(), {
      source: "mock",
      error: null,
      warnings: ["モックデータを表示しています。"],
    });
  }

  try {
    const rows = await fetchSheetRows();
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

export async function getPrefectureData(): Promise<PrefectureDataset> {
  const now = Date.now();
  if (memoryCache && now < memoryCache.expiresAt) {
    return memoryCache.data;
  }

  const data = await loadPrefectureData();
  const ttlMs = data.error
    ? 30_000
    : APP_CONFIG.cacheSeconds * 1000;

  memoryCache = {
    data,
    expiresAt: now + ttlMs,
  };

  return data;
}
