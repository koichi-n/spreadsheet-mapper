import { APP_CONFIG } from "./app-config";

export type AreaDataOptions = {
  /** true ならモック。省略時は環境変数 `USE_MOCK_DATA` */
  useMockData?: boolean;
  sheetId?: string;
  sheetRange?: string;
  serviceAccountEmail?: string;
  privateKey?: string;
  cacheSeconds?: number;
};

export type ResolvedAreaDataOptions = {
  useMockData: boolean;
  sheetId: string;
  sheetRange: string;
  serviceAccountEmail: string;
  privateKey: string;
  cacheSeconds: number;
};

function envFlag(name: string): boolean | undefined {
  const value = process.env[name]?.trim().toLowerCase();
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return undefined;
}

export function areaDataCacheKey(options: AreaDataOptions = {}): string {
  const resolved = resolveAreaDataOptions(options);
  if (resolved.useMockData) return "mock";
  return `sheets:${resolved.sheetId}:${resolved.sheetRange}`;
}

export function resolveAreaDataOptions(
  options: AreaDataOptions = {},
): ResolvedAreaDataOptions {
  return {
    useMockData: options.useMockData ?? envFlag("USE_MOCK_DATA") ?? false,
    sheetId: options.sheetId ?? process.env.GOOGLE_SHEET_ID?.trim() ?? "",
    sheetRange:
      options.sheetRange?.trim() ||
      process.env.GOOGLE_SHEET_RANGE?.trim() ||
      APP_CONFIG.sheetRange,
    serviceAccountEmail:
      options.serviceAccountEmail ??
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() ??
      "",
    privateKey: options.privateKey ?? process.env.GOOGLE_PRIVATE_KEY ?? "",
    cacheSeconds: options.cacheSeconds ?? APP_CONFIG.cacheSeconds,
  };
}
