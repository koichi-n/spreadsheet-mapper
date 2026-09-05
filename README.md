# Spreadsheet Mapper

Googleスプレッドシートを簡易CMSとして使い、47都道府県のデータを日本地図に色分け表示するWebアプリケーションです。

都道府県の紐付けには都道府県名ではなく、JIS都道府県コード（`01`〜`47`）を使います。

## できること

- 47都道府県の実地図（既定）とデフォルメ地図を切り替えて表示する
- `status`（A / B / C / 情報なし）で色分けする
- 都道府県をクリック / タップすると詳細を表示する
- 地図を使わず、一覧からも選択できる
- Google Sheets の更新を数分以内に反映する（キャッシュあり）

## 必要環境

- Node.js 20 以上
- npm

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

`.env.local` は Git にコミットしません。

## 6. GitHub 経由で Vercel にデプロイする

推奨は GitHub リポジトリを Vercel に接続し、`main` への push で自動デプロイする構成です。

### 6.1. GitHub にリポジトリを用意する

まだリモートがない場合の例:

```bash
git add .
git commit -m "Initial commit"
gh repo create spreadsheet-mapper --private --source=. --remote=origin --push
```

### 6.2. Vercel に GitHub リポジトリをインポートする

1. [Vercel Dashboard](https://vercel.com/new) を開く
2. 「Import Git Repository」でこのリポジトリを選ぶ（初回は GitHub 連携の許可が必要）
3. リポジトリが一覧に出ない場合は、[GitHub の Vercel App 設定](https://github.com/settings/installations) で `spreadsheet-mapper` への Repository access を許可する
4. Framework Preset は **Next.js** のままでよい（Build Command: `next build`）
5. 先に環境変数を入れてから Deploy する（次項）

既存の Vercel プロジェクトに後から接続する場合:

```bash
npx vercel link --yes --project spreadsheet-mapper --scope koichi-ns-projects
npx vercel git connect https://github.com/koichi-n/spreadsheet-mapper.git --yes --scope koichi-ns-projects
```

### 6.3. Vercel 側の環境変数

Project Settings → Environment Variables で、ローカルと同じ変数を設定します。

| 変数名 | 本番の例 |
| --- | --- |
| `USE_MOCK_DATA` | まずは `true`（動作確認）。Sheets 接続後は `false` |
| `GOOGLE_SHEET_ID` | 実データ利用時のみ |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | 実データ利用時のみ |
| `GOOGLE_PRIVATE_KEY` | 実データ利用時のみ（1行 + `\n` 推奨） |
| `GOOGLE_SHEET_RANGE` | 省略可（既定 `Sheet1!A:Z`） |

注意:

- `.env.local` は Git に含まれません。本番の値は必ず Vercel に設定してください
- `GOOGLE_PRIVATE_KEY` は1行で入れ、改行を `\n` で表現するのが安全です
- 環境変数を変更したら **Redeploy** してください

### 6.4. 以降の更新

`main` に push すると Vercel が自動で本番デプロイします。Pull Request を作ると Preview デプロイも作成されます。

データは約5分キャッシュします。スプレッドシートを更新すると、最大で数分後にサイトへ反映されます。

## 7. CLI でデプロイする場合（任意）

GitHub 連携の代わりに、ローカルから直接デプロイすることもできます。

```bash
npx vercel login
npx vercel        # Preview
npx vercel --prod # Production
```

## 8. スプレッドシートの想定フォーマット

1行目はヘッダーです。列順は変更しても、ヘッダー名で読み取ります。

| pref_code | prefecture | status | value | description | source_url | updated_at |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | 北海道 | A | 85 | 詳細説明 | https://example.com | 2026-09-01 |
| 02 | 青森県 | B | 63 | 詳細説明 | https://example.com | 2026-09-01 |

- `pref_code` は JIS都道府県コード `01`〜`47`（地図との紐付けキー）
- `status` は `A` / `B` / `C`。それ以外や空欄は「情報なし」
- `value` は数値。空欄や不正な値は表示上 `—`
- `source_url` は `http` / `https` のみリンク化する
- 一部の行だけ壊れても、サイト全体は表示を続ける
- 将来列を増やしても、未知の列は無視される

シート名が `Sheet1` でない場合は `GOOGLE_SHEET_RANGE` を変更してください。例: `データ!A:Z`

## 地図の出典 / ライセンス

既定の地図は [@svg-maps/japan](https://github.com/VictorCazanave/svg-maps/tree/master/packages/japan) です。MapSVG の日本地図を基にしており、ライセンスは **CC BY 4.0** です。

デフォルメ地図も残してあり、画面上の「実地図 / デフォルメ」で切り替えられます。デフォルメ地図は [デフォルメ日本地図 by chizutodesign](https://github.com/chizutodesign/japan-deformed-map) で、ライセンスは **CC0 1.0** です。

初期表示をデフォルメに戻す場合は `src/lib/map-style.ts` の `MAP_STYLE` を `'deformed'` に変更してください。

## 色の変更

色とラベルは `src/lib/status-config.ts` の `STATUS_CONFIG` にまとめています。

将来、`value` によるグラデーション表示へ切り替える場合は、同じファイルの `MAP_COLOR_MODE` を `'value'` に変更できます。MVPでは `status` による色分けを使います。

## 技術構成

- Next.js（App Router）
- TypeScript
- React
- Tailwind CSS
- Google Sheets API（サーバー側のみ）
- Vercel
