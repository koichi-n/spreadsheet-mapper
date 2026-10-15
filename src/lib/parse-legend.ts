import { STATUS_KEYS, type LegendItem, type StatusKey } from "./types";

const STATUS_KEY_SET = new Set<string>(STATUS_KEYS);

function toStatusKey(raw: string): StatusKey | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed === "情報なし") return "unknown";
  const upper = trimmed.toUpperCase();
  if (upper === "STATUS") return null;
  if (upper === "UNKNOWN") return "unknown";
  if (STATUS_KEY_SET.has(upper)) return upper as StatusKey;
  return null;
}

export function parseLegendRows(rows: string[][]): LegendItem[] {
  const seen = new Set<StatusKey>();
  const items: LegendItem[] = [];

  for (const row of rows) {
    const status = toStatusKey(String(row[0] ?? ""));
    const label = String(row[1] ?? "").trim();
    if (!status || !label || seen.has(status)) continue;
    seen.add(status);
    items.push({ status, label });
  }

  return items;
}
