import type { AreaRecord } from "../../lib/types";

export type JapanMapViewProps = {
  prefectures: Record<string, AreaRecord>;
  selectedCode: string | null;
  onSelect: (code: string) => void;
  mapLabel?: string;
};
