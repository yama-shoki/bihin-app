# 備品購入申請アプリ

社内で備品の購入申請から承認までを完結させる Web アプリです。

ここでは「触り方」と「全体像」だけを書いています。中身の話は分けました:

- 設計の判断 (認可・エラー処理・楽観ロック・テスト): [`docs/architecture.md`](./docs/architecture.md)
- データモデル (ER 図 / テーブル定義 / `onDelete` / SSoT 派生): [`docs/data-model.md`](./docs/data-model.md)
- 深掘りした UI/UX の詳細: [`docs/ui-ux.md`](./docs/ui-ux.md)

## クイックスタート

Docker / 外部サービス (Supabase / Firebase 等) / `.env` のいずれも不要にして、clone → `npm install` → `npm run setup` → `npm run dev` の 3 コマンドで誰でもすぐ立ち上げられる構成にしました。詰まりやすい点を順に押さえる形で書いていきます。

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

### 7. DB を視覚的に確認したいとき (任意)

```bash
npm run db:studio
```

Drizzle Studio が起動し、ブラウザで `https://local.drizzle.studio` を開くとテーブルの中身を直接見たり、レコードを書き換えたりできます。動作確認中に「seed の中身を眺めたい」「ステータスを手動で変えたい」といった用途に便利です。

### デモユーザー

`/` で氏名カードをクリックするとログイン。ヘッダー右上のドロップダウンでいつでも切り替えられます。

| 氏名 | 所属 | ロール |
|---|---|---|
| 山田 太郎 | 総務部 | 管理者 |
| 佐藤 花子 | 開発部 | 一般社員 |
| 鈴木 一郎 | 営業部 | 一般社員 |
| 高橋 美咲 | デザイン部 | 一般社員 |

clone してすぐ触れるよう、cookie を保存するだけの dummy login にしてあります。本番なら Better Auth / Supabase Auth / Clerk などに差し替える前提です。

### スクリプト一覧

| コマンド | 何をするか |
|---|---|
| `npm run dev` | 開発サーバ |
| `npm run setup` | DB リセット + migrate + seed |
| `npm run db:studio` | Drizzle Studio で DB をブラウザから閲覧・編集 |
| `npm run check` | biome + tsc + vitest を一括実行 |
| `npm run test:e2e` | Playwright (初回だけ `npx playwright install` が必要) |

## 技術スタック

Next.js 16 (App Router) + React 19 / Mantine 9 / Drizzle ORM + libSQL (SQLite ファイル) / TypeScript / Biome / Vitest 4 / Playwright。選定理由の詳細は [`docs/architecture.md#技術スタックと選定理由`](./docs/architecture.md#技術スタックと選定理由) をご覧ください。

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

業務で使うアプリとして「**迷わずパッと操作できる**」ことを最優先に、6 つの軸で踏み込みました。あわせて、UI 表現 (ラベル・色・アイコン) は `db/constants/` の literal tuple から型レベルで派生させており、`enum` を 1 つ追加すると関連箇所が tsc で炙り出される SSoT 構造で UI 全体の一貫性を担保しています。

詳細は [`docs/ui-ux.md`](./docs/ui-ux.md) をご覧ください。

## 妥協した点 / 作業時間

- 妥協した点ともう少し時間があればやりたかったこと: [`docs/architecture.md#妥協した点もっと時間があればやりたかったこと`](./docs/architecture.md#妥協した点もっと時間があればやりたかったこと)
- 合計 **約 5 時間半** (休憩除く)。フェーズ別の内訳: [`docs/architecture.md#作業時間の内訳`](./docs/architecture.md#作業時間の内訳)

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
