export const APP_CONFIG = {
  title: "都道府県・市区町村別 ○○の状況",
  description:
    "表示単位を切り替えて、都道府県の比較と市区町村への絞り込みができます。地図または一覧から地域を選ぶと、詳細情報を確認できます。",
  cacheSeconds: 300,
  sheetRange: "Sheet1!A:Z",
} as const;
