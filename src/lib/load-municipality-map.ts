export type MunicipalityMapLocation = {
  code: string;
  name: string;
  path: string;
};

export type MunicipalityMapData = {
  prefCode: string;
  viewBox: string;
  locations: MunicipalityMapLocation[];
  inset: {
    viewBox: string;
    locations: MunicipalityMapLocation[];
  } | null;
};

export const DEFAULT_MUNICIPALITY_MAP_BASE_PATH = "/municipality-maps";

export async function loadMunicipalityMap(
  prefCode: string,
  basePath: string = DEFAULT_MUNICIPALITY_MAP_BASE_PATH,
): Promise<MunicipalityMapData> {
  const normalized = basePath.replace(/\/+$/, "");
  const response = await fetch(`${normalized}/${prefCode}.json`);
  if (!response.ok) {
    throw new Error(`市区町村地図を読み込めませんでした (${response.status})`);
  }
  return (await response.json()) as MunicipalityMapData;
}

export function strokeForViewBox(viewBox: string, selected: boolean): number {
  const parts = viewBox.trim().split(/\s+/).map(Number);
  const width = parts[2] ?? 100;
  const height = parts[3] ?? 100;
  const size = Math.min(width, height);
  return selected ? Math.max(size * 0.014, 0.08) : Math.max(size * 0.004, 0.03);
}
