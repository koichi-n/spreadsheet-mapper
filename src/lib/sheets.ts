import { JWT } from "google-auth-library";
import { APP_CONFIG } from "@/lib/app-config";

function normalizePrivateKey(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.replace(/\\n/g, "\n").replace(/^"|"$/g, "");
}

export async function fetchSheetRows(): Promise<string[][]> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY);
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const range = process.env.GOOGLE_SHEET_RANGE ?? APP_CONFIG.sheetRange;

  if (!email || !key || !sheetId) {
    throw new Error("Google Sheets の環境変数が不足しています。");
  }

  const client = new JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const token = await client.getAccessToken();
  if (!token.token) {
    throw new Error("Google API のアクセストークンを取得できませんでした。");
  }

  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(range)}`,
  );
  url.searchParams.set("valueRenderOption", "UNFORMATTED_VALUE");
  url.searchParams.set("dateTimeRenderOption", "FORMATTED_STRING");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token.token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Google Sheets API エラー (${response.status})`);
  }

  const json: unknown = await response.json();
  const values =
    json && typeof json === "object" && "values" in json
      ? (json as { values?: unknown }).values
      : undefined;

  if (!Array.isArray(values)) {
    return [];
  }

  return values.map((row) =>
    Array.isArray(row)
      ? row.map((cell) => (cell == null ? "" : String(cell)))
      : [],
  );
}
