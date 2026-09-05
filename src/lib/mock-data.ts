import { PREFECTURES } from "@/lib/prefectures";
import { toSafeHttpUrl } from "@/lib/safe-url";
import type { PrefectureRecord, StatusKey } from "@/lib/types";

const STATUS_CYCLE: StatusKey[] = ["A", "B", "C"];
const UNKNOWN_CODES = new Set(["10", "25", "47"]);

export function getMockPrefectureRecords(): PrefectureRecord[] {
  return PREFECTURES.map((pref) => {
    const codeNum = Number(pref.code);
    const isUnknown = UNKNOWN_CODES.has(pref.code);
    const status: StatusKey = isUnknown
      ? "unknown"
      : STATUS_CYCLE[codeNum % 3];

    return {
      prefCode: pref.code,
      prefecture: pref.name,
      status,
      value: isUnknown || pref.code === "15" ? null : 40 + ((codeNum * 7) % 61),
      description: isUnknown
        ? ""
        : `${pref.name}のサンプル説明です。モックデータを表示しています。`,
      sourceUrl: isUnknown
        ? null
        : pref.code === "13"
          ? toSafeHttpUrl("https://www.example.com")
          : pref.code === "20"
            ? toSafeHttpUrl("javascript:alert(1)")
            : toSafeHttpUrl("https://example.com"),
      updatedAt: isUnknown ? null : "2026-09-01",
    };
  });
}
