import type { StatusPalette } from "../../lib/status-config";
import type { AreaRecord } from "../../lib/types";

/** full: 名前＋ステータス（＋数値）。name: 名前のみ（範囲選択地図向け） */
export type MapTooltipMode = "full" | "name";

export type JapanMapViewProps = {
  prefectures: Record<string, AreaRecord>;
  selectedCode: string | null;
  onSelect: (code: string) => void;
  mapLabel?: string;
  palette?: StatusPalette;
  /** ホバー時ツールチップの内容。省略時は full */
  tooltipMode?: MapTooltipMode;
};
