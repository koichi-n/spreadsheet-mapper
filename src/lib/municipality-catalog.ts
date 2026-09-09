import catalogJson from "../data/municipality-catalog.json";
import type { MunicipalityMeta } from "./types";

export const MUNICIPALITIES: readonly MunicipalityMeta[] =
  catalogJson as MunicipalityMeta[];

const BY_CODE = new Map(MUNICIPALITIES.map((item) => [item.code, item]));

const BY_PREF = new Map<string, MunicipalityMeta[]>();
for (const item of MUNICIPALITIES) {
  const list = BY_PREF.get(item.prefCode);
  if (list) list.push(item);
  else BY_PREF.set(item.prefCode, [item]);
}

export function getMunicipalityMeta(code: string): MunicipalityMeta | undefined {
  return BY_CODE.get(code);
}

export function municipalitiesInPref(
  prefCode: string,
): readonly MunicipalityMeta[] {
  return BY_PREF.get(prefCode) ?? [];
}

export function isKnownMuniCode(code: string): boolean {
  return BY_CODE.has(code);
}
