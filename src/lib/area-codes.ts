import { isPrefCode } from "./prefectures";

export function normalizePrefCode(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const numeric = Number(trimmed);
  if (Number.isInteger(numeric)) {
    const code = String(numeric).padStart(2, "0");
    return isPrefCode(code) ? code : null;
  }

  const padded = trimmed.padStart(2, "0");
  return isPrefCode(padded) ? padded : null;
}

export function isMuniCodePattern(code: string): boolean {
  return (
    /^\d{5}$/.test(code) &&
    isPrefCode(code.slice(0, 2)) &&
    code.slice(2) !== "000"
  );
}

export function normalizeMuniCode(raw: string): string | null {
  const parsed = parseAreaCode(raw);
  return parsed?.level === "municipality" ? parsed.code : null;
}

export function prefCodeFromMuniCode(muniCode: string): string {
  return muniCode.slice(0, 2);
}

export function parseAreaCode(
  raw: string,
): { level: "prefecture" | "municipality"; code: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const numeric = Number(trimmed.replace(/,/g, ""));
  const digits =
    Number.isInteger(numeric) && numeric >= 0
      ? String(numeric)
      : trimmed.replace(/\s/g, "");

  if (!/^\d+$/.test(digits)) return null;

  if (digits.length <= 2) {
    const code = digits.padStart(2, "0");
    return isPrefCode(code) ? { level: "prefecture", code } : null;
  }

  if (digits.length === 3) return null;

  const five =
    digits.length === 6 ? digits.slice(0, 5) : digits.padStart(5, "0");
  if (five.length !== 5) return null;

  if (five.endsWith("000")) {
    const pref = five.slice(0, 2);
    return isPrefCode(pref) ? { level: "prefecture", code: pref } : null;
  }

  return isMuniCodePattern(five)
    ? { level: "municipality", code: five }
    : null;
}
