export type {
  AreaDataset,
  AreaLevel,
  AreaRecord,
  DataSource,
  MunicipalityMeta,
  PrefectureMeta,
  StatusKey,
} from "./lib/types";
export { STATUS_KEYS } from "./lib/types";

export type { AreaDataOptions } from "./lib/area-data-options";
export { getAreaData, getMunicipalitiesForPref } from "./lib/get-area-data";
export { parseSheetRows } from "./lib/parse-sheet";
export {
  PREFECTURES,
  PREFECTURE_CODES,
  isPrefCode,
  shortPrefectureName,
} from "./lib/prefectures";
export {
  MAP_COLOR_MODE,
  STATUS_CONFIG,
  STATUS_ORDER,
  getAreaColors,
  getStatusConfig,
} from "./lib/status-config";
