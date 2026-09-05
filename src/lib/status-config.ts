import type { PrefectureRecord, StatusKey } from "@/lib/types";

export type ColorMode = "status" | "value";

export const MAP_COLOR_MODE: ColorMode = "status";

export const STATUS_CONFIG: Record<
  StatusKey,
  {
    key: StatusKey;
    label: string;
    fill: string;
    text: string;
    legend: string;
  }
> = {
  A: {
    key: "A",
    label: "A",
    fill: "#123A70",
    text: "#FFFFFF",
    legend: "A",
  },
  B: {
    key: "B",
    label: "B",
    fill: "#2F6F9F",
    text: "#FFFFFF",
    legend: "B",
  },
  C: {
    key: "C",
    label: "C",
    fill: "#A9D0EA",
    text: "#123A70",
    legend: "C",
  },
  unknown: {
    key: "unknown",
    label: "情報なし",
    fill: "#CFD6DD",
    text: "#3D4A57",
    legend: "情報なし",
  },
};

export const STATUS_ORDER: StatusKey[] = ["A", "B", "C", "unknown"];

export function getStatusConfig(status: StatusKey) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.unknown;
}

function interpolateHex(from: string, to: string, t: number): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const a = parse(from);
  const b = parse(to);
  const mix = a.map((channel, i) =>
    Math.round(channel + (b[i] - channel) * t),
  );
  return `#${mix.map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

export function getValueFill(
  value: number,
  min: number,
  max: number,
): string {
  const t = max === min ? 0.5 : Math.min(1, Math.max(0, (value - min) / (max - min)));
  return interpolateHex(STATUS_CONFIG.C.fill, STATUS_CONFIG.A.fill, t);
}

export function getPrefectureColors(
  record: PrefectureRecord,
  valueExtent?: { min: number; max: number },
): { fill: string; text: string } {
  if (
    MAP_COLOR_MODE === "value" &&
    record.value !== null &&
    valueExtent
  ) {
    const fill = getValueFill(record.value, valueExtent.min, valueExtent.max);
    return {
      fill,
      text: record.value > (valueExtent.min + valueExtent.max) / 2
        ? STATUS_CONFIG.A.text
        : STATUS_CONFIG.C.text,
    };
  }

  const config = getStatusConfig(record.status);
  return { fill: config.fill, text: config.text };
}
