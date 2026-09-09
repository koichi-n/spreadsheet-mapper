export const STATUS_KEYS = ["A", "B", "C", "unknown"] as const;

export type StatusKey = (typeof STATUS_KEYS)[number];

export type DataSource = "mock" | "sheets";

export type AreaLevel = "prefecture" | "municipality";

export type AreaRecord = {
  code: string;
  level: AreaLevel;
  prefCode: string;
  name: string;
  status: StatusKey;
  value: number | null;
  description: string;
  sourceUrl: string | null;
  updatedAt: string | null;
  aggregated?: boolean;
};

export type AreaDataset = {
  prefectures: Record<string, AreaRecord>;
  municipalities: Record<string, AreaRecord>;
  source: DataSource;
  fetchedAt: string;
  error: string | null;
  warnings: string[];
};

export type PrefectureMeta = {
  code: string;
  name: string;
};

export type MunicipalityMeta = {
  code: string;
  prefCode: string;
  name: string;
};
