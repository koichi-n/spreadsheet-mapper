import type { AreaDataset } from "./types";

export type MapDataProps = Pick<
  AreaDataset,
  "prefectures" | "source" | "fetchedAt" | "error" | "warnings" | "legend"
>;

/** getAreaData の結果を MapApp に渡す。凡例もここに含む */
export function toMapAppProps(data: MapDataProps): MapDataProps {
  return {
    prefectures: data.prefectures,
    source: data.source,
    fetchedAt: data.fetchedAt,
    error: data.error,
    warnings: data.warnings,
    legend: data.legend,
  };
}
