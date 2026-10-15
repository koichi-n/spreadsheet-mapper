import type { AreaRecord, LegendItem, StatusKey } from "./types";

export type ColorMode = "status" | "value";

export const MAP_COLOR_MODE: ColorMode = "status";

export type StatusPaint = {
  fill: string;
  text: string;
};

export type StatusPalette = Record<StatusKey, StatusPaint>;

const POLICY_BLUE_STOPS = ["#123A70", "#2F6F9F", "#A9D0EA"] as const;
const NO_INFO_PAINT: StatusPaint = { fill: "#FFFFFF", text: "#3D4A57" };
const NO_POLICY_PAINT: StatusPaint = { fill: "#D2D6DB", text: "#3D4A57" };
const SELECTED_STROKE = "#0F172A";
const LIGHT_STROKE = "#B7C2CC";
const DARK_STROKE = "#FFFFFF";

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
    fill: POLICY_BLUE_STOPS[0],
    text: "#FFFFFF",
    legend: "A",
  },
  B: {
    key: "B",
    label: "B",
    fill: POLICY_BLUE_STOPS[1],
    text: "#FFFFFF",
    legend: "B",
  },
  C: {
    key: "C",
    label: "C",
    fill: POLICY_BLUE_STOPS[2],
    text: "#123A70",
    legend: "C",
  },
  D: {
    key: "D",
    label: "D",
    fill: NO_POLICY_PAINT.fill,
    text: NO_POLICY_PAINT.text,
    legend: "D",
  },
  unknown: {
    key: "unknown",
    label: "情報なし",
    fill: NO_INFO_PAINT.fill,
    text: NO_INFO_PAINT.text,
    legend: "情報なし",
  },
};

export const STATUS_ORDER: StatusKey[] = ["A", "B", "C", "D", "unknown"];

export function defaultLegendItems(): { status: StatusKey; label: string }[] {
  return STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_CONFIG[status].legend,
  }));
}

export function getStatusConfig(status: StatusKey) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.unknown;
}

/**
 * 凡例の並びに合わせて色を決める。
 * - 情報なし: 白
 * - 情報がある項目の最後（実施が見られないもの）: 薄いグレー
 * - それ以外: 青の濃淡。先頭が最も濃い
 */
export function paletteFromLegend(items: LegendItem[]): StatusPalette {
  const palette: StatusPalette = {
    A: { fill: STATUS_CONFIG.A.fill, text: STATUS_CONFIG.A.text },
    B: { fill: STATUS_CONFIG.B.fill, text: STATUS_CONFIG.B.text },
    C: { fill: STATUS_CONFIG.C.fill, text: STATUS_CONFIG.C.text },
    D: { fill: STATUS_CONFIG.D.fill, text: STATUS_CONFIG.D.text },
    unknown: { ...NO_INFO_PAINT },
  };

  const known = items.filter((item) => item.status !== "unknown");
  if (known.length === 0) return palette;

  const last = known[known.length - 1];
  palette[last.status] = { ...NO_POLICY_PAINT };

  const policyItems = known.slice(0, -1);
  policyItems.forEach((item, index) => {
    const fill = policyFill(index, policyItems.length);
    palette[item.status] = { fill, text: textOn(fill) };
  });

  return palette;
}

export function paintForStatus(
  status: StatusKey,
  palette?: StatusPalette,
): StatusPaint {
  return palette?.[status] ?? {
    fill: getStatusConfig(status).fill,
    text: getStatusConfig(status).text,
  };
}

export function mapStroke(fill: string, selected: boolean): string {
  if (selected) return SELECTED_STROKE;
  return isLightFill(fill) ? LIGHT_STROKE : DARK_STROKE;
}

function interpolateHex(from: string, to: string, t: number): string {
  const a = parseHex(from);
  const b = parseHex(to);
  const mix = a.map((channel, i) =>
    Math.round(channel + (b[i] - channel) * t),
  );
  return `#${mix.map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

function parseHex(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function policyFill(index: number, count: number): string {
  if (count <= 1) return POLICY_BLUE_STOPS[0];
  const t = index / (count - 1);
  const scaled = t * (POLICY_BLUE_STOPS.length - 1);
  const left = Math.floor(scaled);
  const right = Math.min(left + 1, POLICY_BLUE_STOPS.length - 1);
  return interpolateHex(POLICY_BLUE_STOPS[left], POLICY_BLUE_STOPS[right], scaled - left);
}

function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function textOn(fill: string): string {
  return luminance(fill) > 0.55 ? "#123A70" : "#FFFFFF";
}

function isLightFill(fill: string): boolean {
  return luminance(fill) > 0.82;
}

export function getValueFill(
  value: number,
  min: number,
  max: number,
): string {
  const t = max === min ? 0.5 : Math.min(1, Math.max(0, (value - min) / (max - min)));
  return interpolateHex(STATUS_CONFIG.C.fill, STATUS_CONFIG.A.fill, t);
}

export function getAreaColors(
  record: AreaRecord,
  valueExtent?: { min: number; max: number },
  palette?: StatusPalette,
): StatusPaint {
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

  return paintForStatus(record.status, palette);
}
