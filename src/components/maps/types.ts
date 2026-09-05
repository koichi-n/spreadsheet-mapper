import type { PrefectureRecord } from "@/lib/types";

export type JapanMapViewProps = {
  prefectures: Record<string, PrefectureRecord>;
  selectedCode: string | null;
  onSelect: (code: string) => void;
};
