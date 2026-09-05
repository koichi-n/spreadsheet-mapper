export const APP_CONFIG = {
  title: "都道府県別 ○○の状況",
  description:
    "都道府県ごとのステータスを地図で色分けして表示します。地図または一覧から都道府県を選ぶと、詳細情報を確認できます。",
  cacheSeconds: 300,
  sheetRange: "Sheet1!A:Z",
} as const;
