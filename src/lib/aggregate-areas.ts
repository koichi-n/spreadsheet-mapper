import type { AreaRecord, PrefectureMeta, StatusKey } from "./types";

const STATUS_PRIORITY: StatusKey[] = ["A", "B", "C"];

export function aggregateMunicipalityRecords(
  pref: PrefectureMeta,
  municipalities: AreaRecord[],
): AreaRecord {
  const counts: Record<StatusKey, number> = {
    A: 0,
    B: 0,
    C: 0,
    unknown: 0,
  };
  const values: number[] = [];

  for (const record of municipalities) {
    counts[record.status] += 1;
    if (record.value !== null) values.push(record.value);
  }

  let status: StatusKey = "unknown";
  let bestCount = 0;
  for (const key of STATUS_PRIORITY) {
    if (counts[key] > bestCount) {
      status = key;
      bestCount = counts[key];
    }
  }

  const value =
    values.length === 0
      ? null
      : Math.round((values.reduce((sum, item) => sum + item, 0) / values.length) * 10) /
        10;

  const knownCount = counts.A + counts.B + counts.C;

  return {
    code: pref.code,
    level: "prefecture",
    prefCode: pref.code,
    name: pref.name,
    status,
    value,
    description:
      knownCount > 0
        ? `市区町村 ${municipalities.length} 件のうち、データがある ${knownCount} 件を集計しています。`
        : "",
    sourceUrl: null,
    updatedAt: null,
    aggregated: true,
  };
}
