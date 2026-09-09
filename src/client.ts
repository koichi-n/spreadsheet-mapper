export { MapApp } from "./components/MapApp";
export type { MapAppProps } from "./components/MapApp";
export {
  DEFAULT_MUNICIPALITY_MAP_BASE_PATH,
  loadMunicipalityMap,
} from "./lib/load-municipality-map";
export type {
  MunicipalityMapData,
  MunicipalityMapLocation,
} from "./lib/load-municipality-map";
export {
  MAP_COLOR_MODE,
  STATUS_CONFIG,
  STATUS_ORDER,
  getAreaColors,
  getStatusConfig,
} from "./lib/status-config";
export type {
  AreaDataset,
  AreaLevel,
  AreaRecord,
  DataSource,
  StatusKey,
} from "./lib/types";
