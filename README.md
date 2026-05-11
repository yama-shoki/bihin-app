# 備品購入申請アプリ

社内で備品の購入申請から承認までを完結させる Web アプリです。

ここでは「触り方」と「全体像」だけを書いています。中身の話は分けました:

- 設計の判断 (認可・エラー処理・楽観ロック・テスト): [`docs/architecture.md`](./docs/architecture.md)
- データモデル (ER 図 / テーブル定義 / `onDelete` / SSoT 派生): [`docs/data-model.md`](./docs/data-model.md)
- 深掘りした UI/UX の詳細: [`docs/ui-ux.md`](./docs/ui-ux.md)

## クイックスタート

詰まりやすい点を順に押さえる構成にしてあります。

### 1. ランタイムのバージョン確認

Node.js 20.9 以上 / npm 10 以上が必要です (`package.json` の `engines` で指定)。

```bash
node --version    # v20.9.0 以降
```

```bash
npm --version     # 10.x 以降
```

古い場合は [fnm](https://github.com/Schniz/fnm) / [Volta](https://volta.sh/) / [nvm](https://github.com/nvm-sh/nvm) などで Node を更新してください。

### 2. clone

```bash
git clone https://github.com/yama-shoki/bihin-app
```

```bash
cd bihin-app
```

### 3. 依存 install

```bash
npm install
```

### 4. 環境変数 / DB について

- **`.env` は要りません**。何も設定せずに動きます
- DB は SQLite ファイル (`db/local/local.db`) を **ローカルに自動生成**します。外部サービス (Supabase / Firebase / Docker) は一切使いません
- ローカル DB は `.gitignore` 対象なので、clone 直後にはまだ存在しません。次の `npm run setup` で作られます

### 5. DB セットアップ

```bash
npm run setup    # DB リセット → migrate → seed をまとめて実行
```

### 6. 開発サーバ起動

```bash
npm run dev      # http://localhost:3000
```

ブラウザで開いたら、下のデモユーザー表からどれかをクリックしてログインしてください。

### スクリプト一覧

| コマンド | 何をするか |
|---|---|
| `npm run dev` | 開発サーバ |
| `npm run setup` | DB リセット + migrate + seed |
| `npm run check` | biome + tsc + vitest を一括実行 |
| `npm run test:e2e` | Playwright (初回だけ `npx playwright install` が必要) |

### デモユーザー

`/` で氏名カードをクリックするとログイン。ヘッダー右上のドロップダウンでいつでも切り替えられます。

| 氏名 | 所属 | ロール |
|---|---|---|
| 山田 太郎 | 総務部 | 管理者 |
| 佐藤 花子 | 開発部 | 一般社員 |
| 鈴木 一郎 | 営業部 | 一般社員 |
| 高橋 美咲 | デザイン部 | 一般社員 |

clone してすぐ触れるよう、cookie を保存するだけの dummy login にしてあります。本番なら Better Auth / Supabase Auth / Clerk などに差し替える前提です。

## 技術スタック

| 採用 | 用途 |
|---|---|
| Next.js 16 (App Router) + React 19 | Server Action と RSC で書き込み・読み込みを型付きでつなぐ |
| Mantine 9 + mantine-datatable v8 | Form / Modal / Timeline / Combobox を一貫した API で |
| nuqs v2 | フィルタ・ソート・検索・ページネーションを URL と同期 |
| Drizzle ORM + libSQL (SQLite ファイル) | 外部サービス不要、`npm run setup` だけで再現できる |
| `@holiday-jp/holiday_jp` | 日付入力で土日祝を赤くする |
| Biome / Vitest 4 / Playwright | lint・format を 1 ツール / unit・schema・component・E2E の 4 段テスト |

ライトモード固定 (`forceColorScheme="light"`)。時刻は `dayjs.tz.setDefault("Asia/Tokyo")` で実行環境の TZ に依存しません。

## 機能

| 操作 | 一般社員 | 管理者 |
|---|---|---|
| 申請の作成 (タイトル / 金額 / カテゴリ / 希望購入日) | ✓ | — |
| 自分の申請一覧 | ✓ | — |
| 全社員の申請一覧 | — | ✓ |
| 申請詳細 + 承認履歴 | ✓ (自分の) | ✓ (全件) |
| 申請の編集 (申請中のみ・自分のみ) | ✓ | — |
| 申請の取り下げ (申請中のみ・自分のみ) | ✓ | — |
| 申請の承認・却下 (申請中のみ) | — | ✓ |
| カテゴリ管理 (親/子の追加・編集・削除) | — | ✓ |

ステータスは `申請中 → 承認済 / 却下 / 取り下げ` の 3 経路のみで、確定したら戻りません。**管理者は申請を作れません** (責務分離、`canEdit` / `canWithdraw` を `employee` 専用にしている → 詳細は [`docs/architecture.md#認可-3-段で守る`](./docs/architecture.md#認可-3-段で守る))。

## 深掘りした領域: UI/UX

業務で使うアプリとして「**迷わずパッと操作できる**」を目指しました。具体例と実装は [`docs/ui-ux.md`](./docs/ui-ux.md) をご覧ください。軸は 6 つです:

1. **判断材料とアクションを同じ視野に置く** — 詳細画面で金額・申請者・希望購入日と、承認/却下ボタンを 1 つのカードに集約しています
2. **異常なときだけ目立たせる** — 希望購入日が過ぎている申請中だけ赤バッジ。普段はただの日付として表示します
3. **一覧の状態を URL に同期する** — フィルタ・ソート・ページ・検索の状態が URL に乗るので、リロード・共有・戻るボタンに耐えます
4. **2 人の管理者が同時に承認しても壊れない** — UI 側の二重送信防止とサーバ側の楽観ロックを組み合わせ、後勝ちした側には「他の管理者が処理済」を通知して画面を最新に揃えます
5. **新しい子カテゴリをその場で追加できる** — 検索結果が空のときに「『○○』を追加」option を出します。親未選択時は無効、空文字は拒否、重複は通知、失敗時は入力を維持、の 4 ガード付きです
6. **管理者のカテゴリ管理は Notion 風** — サイドバーから modal を開き、行内で inline 編集・inline 削除確認まで完結します

## 妥協した点・もっと時間があればやりたかったこと

- **多段階承認 / 金額閾値による承認ルート分岐 / 添付ファイル / 申請理由テキスト** は採用しませんでした。主軸の UI/UX と認可・状態遷移に集中したかったためです
- **構造化ログ (pino + correlation ID)** は本番運用では導入したいですが、プロトタイプの主張に直結しないため省略しました
- **コンポーネントテストの網羅** は行わず、StatusBadge の smoke 1 本と E2E 2 本で間接的に担保しました
- **E2E に編集・取り下げ・カテゴリ CRUD のシナリオ** も追加したかったところです。状態遷移・認可・楽観ロックは unit でカバー済みです

## 作業時間

合計 **約 5 時間** (休憩除く)。最初と最後のコミット時刻は 7 時間離れていますが、20:19〜23:25 の 3 時間は晩飯と中断で抜けています。フェーズ別の内訳は [`docs/architecture.md#作業時間の内訳`](./docs/architecture.md#作業時間の内訳)。

## ディレクトリ構成

```
bihin-app/
├── app/                              Next.js App Router
│   ├── (employee)/                   一般社員向け route group
│   │   ├── layout.tsx                  requireRole("employee") + AppShellLayout
│   │   ├── components/                 employee 固有の UI (Form / Combobox / Modal / Table)
│   │   └── requests/
│   │       ├── page.tsx                  自分の申請一覧
│   │       ├── new/page.tsx              新規申請
│   │       └── [id]/
│   │           ├── page.tsx              申請詳細
│   │           └── edit/page.tsx         申請編集 (申請中のみ)
│   │
│   ├── (admin)/                      管理者向け route group
│   │   ├── layout.tsx                  requireRole("admin") + 承認待ち件数バッジ
│   │   ├── components/                 admin 固有の UI (Approve/Reject/カテゴリ管理 Modal / Table)
│   │   └── admin/requests/
│   │       ├── page.tsx                  全申請一覧
│   │       └── [id]/page.tsx             詳細 + 承認/却下
│   │
│   ├── components/
│   │   ├── common/                     ロール横断 UI (Badge / Timeline / Detail / Filter / Search / FadeIn)
│   │   └── layout/                     AppShellLayout / AppHeader / Breadcrumbs / UserSwitcher
│   │
│   ├── constants/                    UI ラベル・色・アイコン (SSoT から派生)
│   │
│   ├── lib/                          純粋関数のドメイン層
│   │   ├── auth.ts                     can{View,Edit,Withdraw,Review}PurchaseRequest helper
│   │   ├── errors.ts                   BusinessError 派生 (Forbidden / NotFound / Conflict / Validation)
│   │   ├── format.ts                   dayjs ラッパー (formatDate / formatYen 等)
│   │   ├── text.ts                     日本語検索の正規化 (カナ→ひら + lowercase)
│   │   ├── jp-holiday.ts               DateInput の祝日判定
│   │   └── purchase-request-status.ts  canTransition... の真理値表
│   │
│   ├── server/
│   │   ├── data/                       読み込み ('server-only' + cache + 認可)
│   │   ├── actions/                    書き込み ('use server' + withActionResult + transaction + 楽観ロック)
│   │   └── lib/                        ActionResult<T> / withActionResult
│   │
│   ├── page.tsx                      ログイン (氏名カード)
│   ├── layout.tsx                    NuqsAdapter → MantineProvider → DatesProvider → ModalsProvider → Notifications
│   ├── error.tsx                     Server Component 内の runtime error
│   ├── forbidden.tsx                 forbidden() 呼び出し時 (403)
│   ├── not-found.tsx                 notFound() 呼び出し時 (404)
│   └── global-error.tsx              RootLayout が死んだ時 (Mantine 抜き素 HTML)
│
├── db/
│   ├── constants/                    literal tuple (SSoT の起点)
│   ├── schema/                       Drizzle table 定義
│   ├── zod/                          createInsertSchema → pick で派生
│   ├── types/                        $inferSelect / $inferInsert / 派生型 re-export
│   ├── migrations/                   drizzle-kit generate 産物
│   ├── seed.ts                       tsx で直接実行
│   └── local/                        local.db (gitignore 対象、`npm run setup` で生成)
│
├── tests/
│   ├── lib/                          状態遷移 / 認可 / errors のユニットテスト
│   ├── db/                           zod schema の境界値
│   ├── actions/                      Server Action (in-memory DB で楽観ロック検証)
│   └── components/                   StatusBadge の smoke
│
├── e2e/                              Playwright (承認 path + 却下 path)
│
├── docs/                             詳細ドキュメント
│   ├── architecture.md                 設計・認可・エラー処理・楽観ロック・テスト戦略
│   ├── data-model.md                   ER 図・テーブル定義・onDelete・SSoT 派生フロー
│   └── ui-ux.md                        深掘りした UI/UX (13 セクション)
│
├── proxy.ts                          Next.js 16 の middleware 後継 (cookie 確認のみ)
├── drizzle.config.ts                 Drizzle Kit 設定
├── playwright.config.ts              Playwright 設定
├── vitest.config.ts                  Vitest 設定
├── biome.json                        lint + format 設定
├── next.config.ts                    Next.js 設定 (reactCompiler: true)
└── package.json                      engines.node = ">=20.9.0"
```
