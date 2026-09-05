import { isPrefCode } from "@/lib/prefectures";
import { toSafeHttpUrl } from "@/lib/safe-url";
import type { PrefectureRecord, StatusKey } from "@/lib/types";

const HEADER_ALIASES: Record<string, keyof SheetColumns> = {
  pref_code: "prefCode",
  prefcode: "prefCode",
  prefecture: "prefecture",
  status: "status",
  value: "value",
  description: "description",
  source_url: "sourceUrl",
  sourceurl: "sourceUrl",
  updated_at: "updatedAt",
  updatedat: "updatedAt",
};

type SheetColumns = {
  prefCode: number;
  prefecture?: number;
  status?: number;
  value?: number;
  description?: number;
  sourceUrl?: number;
  updatedAt?: number;
};

export type ParseSheetResult = {
  records: PrefectureRecord[];
  warnings: string[];
};

function normalizeHeader(value: string): string {
  return value.replace(/^\uFEFF/, "").trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function cell(row: string[], index: number | undefined): string {
  if (index === undefined) return "";
  return String(row[index] ?? "").trim();
}

function normalizePrefCode(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const numeric = Number(trimmed);
  if (Number.isInteger(numeric)) {
    const code = String(numeric).padStart(2, "0");
    return isPrefCode(code) ? code : null;
  }

  const padded = trimmed.padStart(2, "0");
  return isPrefCode(padded) ? padded : null;
}

function parseStatus(raw: string): StatusKey {
  const normalized = raw.trim().toUpperCase();
  if (normalized === "A" || normalized === "B" || normalized === "C") {
    return normalized;
  }
  return "unknown";
}

function parseValue(raw: string): number | null {
  if (!raw) return null;
  const numeric = Number(raw.replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

function parseHeaderMap(headerRow: string[]): SheetColumns | null {
  const columns: Partial<SheetColumns> = {};

  headerRow.forEach((header, index) => {
    const key = HEADER_ALIASES[normalizeHeader(header)];
    if (key !== undefined && columns[key] === undefined) {
      columns[key] = index;
    }
  });

  if (columns.prefCode === undefined) {
    return null;
  }

  return columns as SheetColumns;
}

export function parseSheetRows(rows: string[][]): ParseSheetResult {
  const warnings: string[] = [];

  if (rows.length === 0) {
    return { records: [], warnings: ["スプレッドシートが空です。"] };
  }

  const columns = parseHeaderMap(rows[0] ?? []);
  if (!columns) {
    return {
      records: [],
      warnings: ["ヘッダー行に pref_code 列が見つかりません。"],
    };
  }

  const seen = new Set<string>();
  const records: PrefectureRecord[] = [];
  let invalidPrefCodeCount = 0;
  let duplicateCount = 0;

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i] ?? [];
    const isEmpty = row.every((value) => String(value ?? "").trim() === "");
    if (isEmpty) continue;

    const prefCode = normalizePrefCode(cell(row, columns.prefCode));
    if (!prefCode) {
      invalidPrefCodeCount += 1;
      continue;
    }

    if (seen.has(prefCode)) {
      duplicateCount += 1;
      continue;
    }
    seen.add(prefCode);

    records.push({
      prefCode,
      prefecture: cell(row, columns.prefecture),
      status: parseStatus(cell(row, columns.status)),
      value: parseValue(cell(row, columns.value)),
      description: cell(row, columns.description),
      sourceUrl: toSafeHttpUrl(cell(row, columns.sourceUrl)),
      updatedAt: cell(row, columns.updatedAt) || null,
    });
  }

  if (invalidPrefCodeCount > 0) {
    warnings.push(`pref_code が不正な行を ${invalidPrefCodeCount} 件スキップしました。`);
  }
  if (duplicateCount > 0) {
    warnings.push(`重複した pref_code を ${duplicateCount} 件スキップしました。`);
  }

  return { records, warnings };
}
