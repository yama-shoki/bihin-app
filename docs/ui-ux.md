# UI/UX

「業務で使うアプリとして、迷わずパッと操作できる」を軸に踏み込んだ箇所をまとめます。

## 1. 判断材料とアクションを同じ視野に置く

申請詳細では、金額・申請者・希望購入日と「承認」「却下」ボタンを 1 つのカードに収めて視線の往復をなくしています。承認履歴は別カードで Timeline 表示。

employee 視点でも admin 視点でも同じ構造で、`PurchaseRequestDetail` の `actions` slot に渡す中身だけが違います (employee = 編集/取り下げ、admin = 承認/却下)。

## 2. 期限超過のときだけ強調する

希望購入日は普段は「2026/06/13 (金)」と淡々と表示するだけです。**過ぎている申請中** (= 納期が過ぎているのに承認待ち) のときだけ赤 + 「期限超過」バッジを出します。

「あと N 日」のような常時表示は採用していません。普段の情報量が多いと、本当に異常なときに気付けないからです。

## 3. URL 駆動の一覧画面

フィルタ・ソート・ページ・検索文字列を URL に同期しています:

```
/requests?status=pending&q=USB&parentCategoryId=...&sortColumn=createdAt&page=2
```

- リロード保持・URL 共有・戻るボタン対応
- `useQueryStates` 1 個で済むので `useState` を 6 個並べる必要がない
- `throttleMs: 300` で履歴の汚れを抑制

## 4. 日本語検索の正規化

「USB / ｕｓｂ / Usb / うえぶかめら / ウエブカメラ」が同じ検索キーになります。

1. カタカナ → ひらがな (`[ァ-ヶ]` の char code に -0x60)
2. 大文字英字 → 小文字

検索入力側は `useDebouncedCallback(300ms)` で URL 同期します。入力は即座に UI に反映、URL 更新だけ debounce する二段構え。

## 5. 楽観ロックの競合 UX

複数の admin が同時に承認/却下したり、employee が編集中に admin が承認したりした時の見せ方です。

**UI 側**: 送信中はボタンを `loading + disabled` + `closeOnClickOutside={!submitting}` で二重送信防止。確定済の申請は承認/却下/取り下げボタンを描画しない。

**サーバ側**: `WHERE status='pending'` 付きの UPDATE。0 件返ったら `ConflictError`。

**UX 接続**: 競合検出時は「他の管理者が処理しました」を通知 + `router.refresh()` で画面を最新化。編集 form は CONFLICT を受けると詳細画面に戻して refresh。**「他の人が処理しました」と見えること自体が業務 UI の安心感** に直結すると考えました。

## 6. 子カテゴリを画面遷移なしで追加

検索文字列にカテゴリがなければドロップダウンに「『○○』を追加」が出ます。4 つのガード付き:

1. **子のみ追加可** — 親未選択時は input を disable
2. **空文字 reject** — `search.trim()` が空なら追加 option を出さない
3. **UNIQUE 衝突** — サーバ側の UNIQUE 違反を `ConflictError` で捕捉して「同名カテゴリが既に存在します」と通知
4. **失敗時 search 維持** — 失敗時に input を reset しない (ユーザーが入力をやり直さなくて済む)

## 7. 管理者のカテゴリ管理 (Notion 風)

サイドバーから modal を開いて、その中で親/子カテゴリの追加・編集・削除が完結します。

- 鉛筆アイコン → 行が `TextInput` に切り替わり inline 編集 (Enter で保存 / Esc でキャンセル)
- ゴミ箱アイコン → 行が赤い「削除しますか?」に切り替わり inline 確認 (**別 modal を重ねない**)
- 削除失敗 (FK 制約違反) は「参照中のため削除できません」と通知

専用ページを作らず modal で完結させたのは、頻度の低い管理タスクのために独立画面を増やすより、サイドバーから 1 クリックで開閉できる動線のほうが軽いと判断したからです。

inline 編集の `TextInput` は IME 変換中の Enter を `event.nativeEvent.isComposing` で弾いて、変換確定の Enter で誤 submit しないようにしています。

## 8. レスポンシブ (モバイル対応)

| 要素 | PC | モバイル (`< 48em`) |
|---|---|---|
| Navbar | 240px 固定で常時表示 | Burger で開閉、`maxWidth: 80vw`、外側 click で閉じる |
| 一覧テーブル | `mantine-datatable` | Card list にフォールバック |
| Filter 行 | 横並び | 折り返し、入力幅 100% |

`AppShellLayout` が drawer の開閉 / レスポンシブ制御をまとめて持つので、各ロールの `layout.tsx` は header と sidebar の slot を渡すだけで済みます。Server Component から Client に関数 props を渡せない React 19 の制約があるので、「閉じる」コールバックは Context 経由で sidebar に届けています。

## 9. DateInput の祝日強調

`@holiday-jp/holiday_jp` で土日祝の日付を赤くしています。

```ts
getDayProps={(date) => {
  const d = new Date(date);
  if (!isJapaneseHoliday(d)) return {};
  return {
    style: { color: "var(--mantine-color-red-6)" },
    title: getJapaneseHolidayName(d) ?? undefined,
  };
}}
```

業務日の調整に直結する小さな配慮です。

## 10. UI の一貫性を型レベルの SSoT で支える

ラベル・色・アイコンといった UI 表現を `db/constants/` の literal tuple から **派生** させています。

```
db/constants/   (literal tuple、唯一の真実)
  ├─ db/schema/      Drizzle table enum
  ├─ db/zod/         createInsertSchema → pick で派生
  ├─ db/types/       $inferSelect / $inferInsert
  └─ app/constants/  LABELS / BADGE_COLORS / ICONS
        ↓
   Badge / Filter / Detail / Timeline / Form すべて参照
```

例えば `PURCHASE_REQUEST_STATUSES` に `withdrawn` を追加した時、ラベル・色・アイコン・Filter の集計・zod の許容値・Server 側 schema、これら全部の不足を tsc が同時に検出しました。一貫性を「コードレビューで気をつける」ではなく「型システムで強制する」状態にしているのが、UI 上で揺れない用語・色・アイコンを保つ土台です。

## 11. コンポーネント分割の方針

| 種類 | 場所 |
|---|---|
| ロール横断で使う UI | `app/components/common/` |
| layout 系 | `app/components/layout/` |
| 一般社員 固有 | `app/(employee)/components/` |
| 管理者 固有 | `app/(admin)/components/` |

`PurchaseRequestDetail` は employee と admin 両方から呼ばれ、差分は `actions` slot だけ。一方で Table はロールごとの差分 (申請者列の有無など) に意味があるので二本立てを維持しました。**共通化のために設計を歪めない**のが原則です。
