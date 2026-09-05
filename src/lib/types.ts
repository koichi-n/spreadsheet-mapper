export const STATUS_KEYS = ["A", "B", "C", "unknown"] as const;

export type StatusKey = (typeof STATUS_KEYS)[number];

export type DataSource = "mock" | "sheets";

export type PrefectureRecord = {
  prefCode: string;
  prefecture: string;
  status: StatusKey;
  value: number | null;
  description: string;
  sourceUrl: string | null;
  updatedAt: string | null;
};

export type PrefectureDataset = {
  prefectures: Record<string, PrefectureRecord>;
  source: DataSource;
  fetchedAt: string;
  error: string | null;
  warnings: string[];
};

export type PrefectureMeta = {
  code: string;
  name: string;
};
