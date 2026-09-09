import {
  normalizeMuniCode,
  normalizePrefCode,
  parseAreaCode,
  prefCodeFromMuniCode,
} from "./area-codes";
import { toSafeHttpUrl } from "./safe-url";
import type { AreaRecord, StatusKey } from "./types";

const HEADER_ALIASES: Record<string, keyof SheetColumns> = {
  pref_code: "prefCode",
  prefcode: "prefCode",
  muni_code: "muniCode",
  municode: "muniCode",
  city_code: "muniCode",
  citycode: "muniCode",
  municipality_code: "muniCode",
  jis_code: "areaCode",
  jiscode: "areaCode",
  area_code: "areaCode",
  areacode: "areaCode",
  code: "areaCode",
  prefecture: "prefecture",
  municipality: "municipality",
  city: "municipality",
  name: "name",
  status: "status",
  value: "value",
  description: "description",
  source_url: "sourceUrl",
  sourceurl: "sourceUrl",
  updated_at: "updatedAt",
  updatedat: "updatedAt",
};

type SheetColumns = {
  prefCode?: number;
  muniCode?: number;
  areaCode?: number;
  prefecture?: number;
  municipality?: number;
  name?: number;
  status?: number;
  value?: number;
  description?: number;
  sourceUrl?: number;
  updatedAt?: number;
};

export type ParseSheetResult = {
  records: AreaRecord[];
  warnings: string[];
};

function normalizeHeader(value: string): string {
  return value.replace(/^\uFEFF/, "").trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function cell(row: string[], index: number | undefined): string {
  if (index === undefined) return "";
  return String(row[index] ?? "").trim();
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
  const columns: SheetColumns = {};

  headerRow.forEach((header, index) => {
    const key = HEADER_ALIASES[normalizeHeader(header)];
    if (key !== undefined && columns[key] === undefined) {
      columns[key] = index;
    }
  });

  if (
    columns.prefCode === undefined &&
    columns.muniCode === undefined &&
    columns.areaCode === undefined
  ) {
    return null;
  }

  return columns;
}

function classifyRow(
  columns: SheetColumns,
  row: string[],
): { level: AreaRecord["level"]; code: string } | null {
  const muniRaw = cell(row, columns.muniCode);
  if (muniRaw) {
    const code = normalizeMuniCode(muniRaw);
    return code ? { level: "municipality", code } : null;
  }

  const areaRaw = cell(row, columns.areaCode);
  if (areaRaw) {
    return parseAreaCode(areaRaw);
  }

  const prefRaw = cell(row, columns.prefCode);
  if (prefRaw) {
    const code = normalizePrefCode(prefRaw);
    return code ? { level: "prefecture", code } : null;
  }

  return null;
}

function displayName(
  level: AreaRecord["level"],
  columns: SheetColumns,
  row: string[],
): string {
  if (level === "municipality") {
    return cell(row, columns.municipality) || cell(row, columns.name);
  }
  return cell(row, columns.prefecture) || cell(row, columns.name);
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
      warnings: [
        "ヘッダー行に pref_code / muni_code / code のいずれかの列が見つかりません。",
      ],
    };
  }

  const seen = new Set<string>();
  const records: AreaRecord[] = [];
  let invalidCodeCount = 0;
  let duplicateCount = 0;
  let skippedEmptyCodeCount = 0;

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i] ?? [];
    const isEmpty = row.every((value) => String(value ?? "").trim() === "");
    if (isEmpty) continue;

    const classified = classifyRow(columns, row);
    if (!classified) {
      const hasAnyCode =
        cell(row, columns.muniCode) ||
        cell(row, columns.areaCode) ||
        cell(row, columns.prefCode);
      if (hasAnyCode) invalidCodeCount += 1;
      else skippedEmptyCodeCount += 1;
      continue;
    }

    const key = `${classified.level}:${classified.code}`;
    if (seen.has(key)) {
      duplicateCount += 1;
      continue;
    }
    seen.add(key);

    const prefCode =
      classified.level === "municipality"
        ? prefCodeFromMuniCode(classified.code)
        : classified.code;

    records.push({
      code: classified.code,
      level: classified.level,
      prefCode,
      name: displayName(classified.level, columns, row),
      status: parseStatus(cell(row, columns.status)),
      value: parseValue(cell(row, columns.value)),
      description: cell(row, columns.description),
      sourceUrl: toSafeHttpUrl(cell(row, columns.sourceUrl)),
      updatedAt: cell(row, columns.updatedAt) || null,
    });
  }

  if (invalidCodeCount > 0) {
    warnings.push(`地域コードが不正な行を ${invalidCodeCount} 件スキップしました。`);
  }
  if (duplicateCount > 0) {
    warnings.push(`重複した地域コードを ${duplicateCount} 件スキップしました。`);
  }
  if (skippedEmptyCodeCount > 0) {
    warnings.push(
      `地域コードが空の行を ${skippedEmptyCodeCount} 件スキップしました。`,
    );
  }

  return { records, warnings };
}
