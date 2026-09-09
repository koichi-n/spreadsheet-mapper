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
export type { MapAppProps } from "./components/MapApp";
export type {
  MunicipalityMapData,
  MunicipalityMapLocation,
} from "./lib/load-municipality-map";
export { DEFAULT_MUNICIPALITY_MAP_BASE_PATH } from "./lib/load-municipality-map";

export * from "./server";
export * from "./client";
