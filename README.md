# Spreadsheet Mapper

Googleスプレッドシートを簡易CMSとして使い、都道府県・市区町村のデータを日本地図に色分け表示するライブラリです。このリポジトリ自身がデモアプリにもなっています。

地域の紐付けには名称ではなく、全国地方公共団体コードを使います。都道府県は2桁（`01`〜`47`）、市区町村は5桁（例: `13101` 千代田区）です。

表示単位を「都道府県」と「市区町村」で切り替えられます。都道府県単位では全国比較と詳細表示、市区町村単位では選んだ都道府県の中をさらに絞り込みます。

## できること

- 47都道府県の実地図（既定）とデフォルメ地図を切り替えて表示する
- 表示単位を都道府県 / 市区町村で切り替える
- 都道府県を選ぶと詳細を表示し、市区町村単位へ切り替えるとその都道府県の地図が開く
- `status`（A / B / C / 情報なし）で色分けする
- 市区町村をクリック / タップすると詳細を表示する
- 地図を使わず、一覧からも選択できる
- Google Sheets の更新を数分以内に反映する（キャッシュあり）

## 必要環境

- Node.js 20 以上
- npm
- ライブラリとして使う場合は、ホストが **Next.js（App Router）** であること

特定のホスティング（Vercel など）には依存しません。Sheets API はサーバー側で呼ぶため、静的ホスト単体では動きません。

## 1. ローカルでの起動方法

```bash
npm install
cp .env.example .env.local
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

初期状態では `USE_MOCK_DATA=true` のため、Google Sheets を設定しなくても47都道府県の画面を確認できます。

## 2. Google Cloud / Google Sheets API の設定方法

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成する
2. 「APIとサービス」→「ライブラリ」を開く
3. **Google Sheets API** を検索して有効化する

ブラウザから Sheets API を直接呼び出す構成ではありません。認証情報は Next.js のサーバー側だけで使います。

## 3. サービスアカウントの作成方法

1. Google Cloud Console の「APIとサービス」→「認証情報」を開く
2. 「認証情報を作成」→「サービスアカウント」を選ぶ
3. 名前を入力して作成する（例: `spreadsheet-mapper`）
4. 作成したサービスアカウントを開き、「キー」タブで「鍵を追加」→「JSON」を選ぶ
5. ダウンロードした JSON を開く
   - `client_email` を `GOOGLE_SERVICE_ACCOUNT_EMAIL` に使う
   - `private_key` を `GOOGLE_PRIVATE_KEY` に使う

JSONキーファイル自体をリポジトリに置かないでください。

## 4. 対象Googleスプレッドシートをサービスアカウントに共有する方法

スプレッドシート自体は一般公開しなくて構いません。

1. 対象のGoogleスプレッドシートを開く
2. 「共有」を開く
3. サービスアカウントのメールアドレス（`client_email`）を追加する
4. 権限は **閲覧者** で十分です

スプレッドシートIDは、URLの次の部分です。

```text
https://docs.google.com/spreadsheets/d/【ここが GOOGLE_SHEET_ID】/edit
```

## 5. 必要な環境変数

`.env.local` に次を設定します。

| 変数名 | 必須 | 説明 |
| --- | --- | --- |
| `USE_MOCK_DATA` | いいえ | `true` でモックデータ、`false` で Google Sheets |
| `GOOGLE_SHEET_ID` | 実データ利用時 | スプレッドシートID |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | 実データ利用時 | サービスアカウントのメールアドレス |
| `GOOGLE_PRIVATE_KEY` | 実データ利用時 | サービスアカウントの秘密鍵 |
| `GOOGLE_SHEET_RANGE` | いいえ | 読み取り範囲。省略時は `Sheet1!A:Z` |

`GOOGLE_PRIVATE_KEY` は次のいずれかで設定できます。

```bash
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

または:

```bash
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIE...
-----END PRIVATE KEY-----
"
```

実データに切り替える例:

```bash
USE_MOCK_DATA=false
GOOGLE_SHEET_ID=your-sheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

`.env.local` は Git にコミットしません。本番では同じ変数を、使うホスティングの環境変数として設定してください。

## 6. デモアプリのデプロイ

このリポジトリは Next.js アプリとしても起動できます。ライブラリとして他アプリに埋め込む場合は、デプロイ先はホストアプリ側の話です（[ライブラリとして使う](#ライブラリとして使う)）。

必要なのは **Node.js 上で Next.js を動かせる環境** です。Vercel / Netlify / Cloudflare（Node 互換） / Docker / VPS など、どこでも構いません。

```bash
npm install
npm run build
npm start
```

Framework Preset がある場合は **Next.js**、ビルドは `next build`、起動は `next start`（またはホストの Next.js 既定）です。

本番の環境変数はローカルと同じです。デプロイ前に設定し、変更後は再デプロイしてください。

| 変数名 | 本番の例 |
| --- | --- |
| `USE_MOCK_DATA` | まずは `true`（動作確認）。Sheets 接続後は `false` |
| `GOOGLE_SHEET_ID` | 実データ利用時のみ |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | 実データ利用時のみ |
| `GOOGLE_PRIVATE_KEY` | 実データ利用時のみ（1行 + `\n` 推奨） |
| `GOOGLE_SHEET_RANGE` | 省略可（既定 `Sheet1!A:Z`） |

- `.env.local` は Git に含まれません。本番の値はホスト側に設定してください
- `GOOGLE_PRIVATE_KEY` は1行で入れ、改行を `\n` で表現するのが安全です
- データはプロセス内で約5分キャッシュします。サーバーレスではインスタンスが分かれるため、効き方は環境によって異なります

GitHub に上げる場合の例:

```bash
git add .
git commit -m "Initial commit"
gh repo create spreadsheet-mapper --private --source=. --remote=origin --push
```

公開リポジトリにする場合は `--private` を外してください。秘密鍵はコミットしないでください。

### 例: Vercel

Next.js のホストの一例です。必須ではありません。

1. ホスティングのダッシュボードで Git リポジトリをインポートする
2. Framework Preset は **Next.js**
3. 先に環境変数を入れてからデプロイする

CLI を使う場合:

```bash
npx vercel login
npx vercel link --yes --project your-project-name --scope your-team-slug
npx vercel git connect https://github.com/your-org/spreadsheet-mapper.git --yes --scope your-team-slug
npx vercel        # Preview
npx vercel --prod # Production
```

`your-project-name` / `your-team-slug` / `your-org` は、自分のプロジェクト名・チーム（または個人アカウント）・GitHub の所有者名に置き換えてください。

## 7. スプレッドシートの想定フォーマット

1行目はヘッダーです。列順は変更しても、ヘッダー名で読み取ります。

市区町村データを使う場合（推奨）:

| muni_code | municipality | status | value | description | source_url | updated_at |
| --- | --- | --- | --- | --- | --- | --- |
| 01100 | 札幌市 | A | 85 | 詳細説明 | https://example.com | 2026-09-01 |
| 13101 | 千代田区 | B | 63 | 詳細説明 | https://example.com | 2026-09-01 |

都道府県データだけでも動きます（従来どおり）:

| pref_code | prefecture | status | value | description | source_url | updated_at |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | 北海道 | A | 85 | 詳細説明 | https://example.com | 2026-09-01 |
| 13 | 東京都 | B | 63 | 詳細説明 | https://example.com | 2026-09-01 |

- `muni_code` は全国地方公共団体コード5桁（地図との紐付けキー）。Excelで先頭ゼロが落ちても復元します。チェックデジット付き6桁も先頭5桁として読みます
- `pref_code` は JIS都道府県コード `01`〜`47`
- 単一の `code` 列でも可。2桁なら都道府県、5桁（または6桁）なら市区町村と判定します
- 両方の行を混在させられます。都道府県行があれば全国地図の色に使い、市区町村行は市区町村表示に使います。都道府県行がなければ、市区町村の多数派ステータスで全国地図を塗ります
- `status` は `A` / `B` / `C`。それ以外や空欄は「情報なし」
- `value` は数値。空欄や不正な値は表示上 `—`
- `source_url` は `http` / `https` のみリンク化する
- 一部の行だけ壊れても、サイト全体は表示を続ける
- 将来列を増やしても、未知の列は無視される

政令指定都市は **市コード** で紐付けます（例: 札幌市 `01100`）。行政区コード（`01101` など）は地図に出ません。東京23区は特別区なので区コード（`13101` 〜 `13123`）を使います。

シート名が `Sheet1` でない場合は `GOOGLE_SHEET_RANGE` を変更してください。例: `データ!A:Z`

## 地図の出典 / ライセンス

既定の全国地図は [@svg-maps/japan](https://github.com/VictorCazanave/svg-maps/tree/master/packages/japan) です。MapSVG の日本地図を基にしており、ライセンスは **CC BY 4.0** です。

デフォルメ地図も残してあり、画面上の「実地図 / デフォルメ」で切り替えられます。デフォルメ地図は [デフォルメ日本地図 by chizutodesign](https://github.com/chizutodesign/japan-deformed-map) で、ライセンスは **CC0 1.0** です。

市区町村界は [jpn-atlas](https://github.com/biskwikman/jpn-atlas)（**BSD-3-Clause**）です。国土地理院「地球地図日本 2016」を加工したもので、2016年時点の市区町村です。合併などで現行と異なる場合があります。地図JSONを再生成する場合:

```bash
npm run build:maps
```

初期表示をデフォルメに戻す場合は `src/lib/map-style.ts` の `MAP_STYLE` を `'deformed'` に変更してください。

## ライブラリとして使う

別の Next.js アプリ（例: 団体サイト）からは、このパッケージを依存として入れ、**そのアプリの中で**地図を描画します。コアのデプロイ先へ地図を取りに行く構成ではありません。ホストアプリは Next.js が動けばよく、デプロイ先は問いません。

npm 公開前はローカルパスか GitHub で足します。

```bash
npm install ../spreadsheet-mapper
```

```json
{
  "dependencies": {
    "spreadsheet-mapper": "file:../spreadsheet-mapper"
  }
}
```

Next.js 側でパッケージをトランスパイルします。

```ts
// next.config.ts
const nextConfig = {
  transpilePackages: ["spreadsheet-mapper"],
};

export default nextConfig;
```

Tailwind CSS v4 では、コアのクラスが消えないようソースを足します。

```css
@import "tailwindcss";
@import "spreadsheet-mapper/styles.css";
@source "../node_modules/spreadsheet-mapper/src";
```

市区町村の境界 JSON はコアの `public/municipality-maps/` にあります。利用側の `public` へコピーしてください。

```bash
npx spreadsheet-mapper-copy-maps public/municipality-maps
```

サーバー用とクライアント用は入口を分けます（混ぜると Client Component がサーバーコードを巻き込みます）。

```tsx
// app/maps/[slug]/page.tsx （Server Component）
import { getAreaData } from "spreadsheet-mapper/server";
import { MapApp } from "spreadsheet-mapper/client";

export default async function Page() {
  const sheet = {
    useMockData: true,
    sheetId: "...",
    sheetRange: "Sheet1!A:Z",
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY,
  };
  const data = await getAreaData(sheet);

  return (
    <MapApp
      prefectures={data.prefectures}
      source={data.source}
      fetchedAt={data.fetchedAt}
      error={data.error}
      warnings={data.warnings}
      showHeader={false}
      municipalitiesPathTemplate="/api/maps/your-slug/municipalities/{prefCode}"
    />
  );
}
```

市区町村の Route Handler では、同じシート設定で `getMunicipalitiesForPref` を呼びます。データセットが複数あるときは、シートごとに options を変えます。

```ts
import { getMunicipalitiesForPref, isPrefCode } from "spreadsheet-mapper/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ prefCode: string }> },
) {
  const { prefCode } = await params;
  if (!isPrefCode(prefCode)) {
    return Response.json({ error: "invalid pref code" }, { status: 400 });
  }
  const records = await getMunicipalitiesForPref(prefCode, {
    useMockData: true,
    sheetId: "...",
  });
  return Response.json({ records });
}
```

`getAreaData` に渡す認証・シート ID は利用側の環境変数です。コア側の `.env` はデモアプリ専用です。

## 色の変更

色とラベルは `src/lib/status-config.ts` の `STATUS_CONFIG` にまとめています。

将来、`value` によるグラデーション表示へ切り替える場合は、同じファイルの `MAP_COLOR_MODE` を `'value'` に変更できます。MVPでは `status` による色分けを使います。

## 技術構成

- Next.js（App Router）
- TypeScript
- React
- Tailwind CSS
- Google Sheets API（サーバー側のみ）
