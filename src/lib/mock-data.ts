import { MUNICIPALITIES } from "./municipality-catalog";
import { toSafeHttpUrl } from "./safe-url";
import type { AreaRecord, StatusKey } from "./types";

const STATUS_CYCLE: StatusKey[] = ["A", "B", "C"];

export function getMockAreaRecords(): AreaRecord[] {
  return MUNICIPALITIES.map((muni) => {
    const codeNum = Number(muni.code);
    const isUnknown = codeNum % 17 === 0;
    const status: StatusKey = isUnknown
      ? "unknown"
      : STATUS_CYCLE[codeNum % 3];

    return {
      code: muni.code,
      level: "municipality",
      prefCode: muni.prefCode,
      name: muni.name,
      status,
      value: isUnknown ? null : 40 + (codeNum % 61),
      description: isUnknown ? "" : `${muni.name}のサンプル説明です。`,
      sourceUrl: isUnknown
        ? null
        : codeNum % 29 === 0
          ? toSafeHttpUrl("https://example.com")
          : null,
      updatedAt: isUnknown ? null : "2026-09-01",
    };
  });
}
