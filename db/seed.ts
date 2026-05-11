import { db } from "./index";
import {
  approvalHistories,
  childCategories,
  parentCategories,
  purchaseRequests,
  users,
} from "./schema";
import type {
  ApprovalHistoryInsert,
  PurchaseRequestInsert,
  PurchaseRequestStatus,
} from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

const daysAgo = (days: number, base: number = Date.now()): Date =>
  new Date(base - days * DAY_MS);

const daysFromNow = (days: number, base: number = Date.now()): Date =>
  new Date(base + days * DAY_MS);

// * schema 由来の型でロック。status enum 追加 (例: "in_review") で seed もコンパイルエラーになる
type PurchaseRequestSpec = Pick<
  PurchaseRequestInsert,
  | "applicantUserId"
  | "title"
  | "amountYen"
  | "childCategoryId"
  | "desiredPurchaseDate"
> & {
  status: PurchaseRequestStatus;
  createdDaysAgo: number;
};

// * title 内のキーワードで却下理由を切り替えるテーブル (UI 確認用の現実味を担保)
const REJECTION_RULES = [
  {
    pattern: "ゲーミング",
    comment:
      "個人利用との切り分けが困難なため、業務利用範囲を明確にしてから再申請してください。",
  },
  {
    pattern: "高級",
    comment:
      "予算上限超過のため。代替案として通常価格帯のものをご検討ください。",
  },
] as const satisfies readonly { pattern: string; comment: string }[];

const DEFAULT_REJECTION_COMMENT = "業務関連性が認められないため。";

function rejectionComment(title: string): string {
  return (
    REJECTION_RULES.find((rule) => title.includes(rule.pattern))?.comment ??
    DEFAULT_REJECTION_COMMENT
  );
}

async function main(): Promise<void> {
  console.log("Seeding database...");

  await db.delete(approvalHistories);
  await db.delete(purchaseRequests);
  await db.delete(childCategories);
  await db.delete(parentCategories);
  await db.delete(users);

  const [admin, emp1, emp2, emp3] = await db
    .insert(users)
    .values([
      { name: "山田 太郎", department: "総務部", role: "admin" },
      { name: "佐藤 花子", department: "開発部", role: "employee" },
      { name: "鈴木 一郎", department: "営業部", role: "employee" },
      { name: "高橋 美咲", department: "デザイン部", role: "employee" },
    ])
    .returning();

  if (!admin || !emp1 || !emp2 || !emp3) {
    throw new Error("Failed to insert users");
  }

  const [parentPc, parentOffice, parentSw, parentOther] = await db
    .insert(parentCategories)
    .values([
      { name: "PC周辺機器" },
      { name: "オフィス用品" },
      { name: "ソフトウェア" },
      { name: "その他" },
    ])
    .returning();

  if (!parentPc || !parentOffice || !parentSw || !parentOther) {
    throw new Error("Failed to insert parent categories");
  }

  const childCatRows = await db
    .insert(childCategories)
    .values([
      { parentCategoryId: parentPc.id, name: "モニター" },
      { parentCategoryId: parentPc.id, name: "キーボード" },
      { parentCategoryId: parentPc.id, name: "マウス" },
      { parentCategoryId: parentOffice.id, name: "文房具" },
      { parentCategoryId: parentOffice.id, name: "デスク" },
      { parentCategoryId: parentOffice.id, name: "椅子" },
      { parentCategoryId: parentSw.id, name: "開発ツール" },
      { parentCategoryId: parentSw.id, name: "デザインツール" },
      { parentCategoryId: parentSw.id, name: "SaaSサブスク" },
      { parentCategoryId: parentOther.id, name: "書籍" },
      { parentCategoryId: parentOther.id, name: "その他" },
    ])
    .returning();

  const childCat = (index: number): string => {
    const row = childCatRows[index];
    if (!row) {
      throw new Error(`child category ${index} missing`);
    }
    return row.id;
  };

  // * createdDaysAgo は申請日昇順 (pending=新しい / approved=中間 / rejected=古い) で UI 確認しやすく配置
  const specs = [
    {
      applicantUserId: emp1.id,
      title: "27インチ4Kモニター",
      amountYen: 65000,
      childCategoryId: childCat(0),
      desiredPurchaseDate: daysFromNow(7),
      status: "pending",
      createdDaysAgo: 1,
    },
    {
      applicantUserId: emp2.id,
      title: "メカニカルキーボード",
      amountYen: 18000,
      childCategoryId: childCat(1),
      desiredPurchaseDate: null,
      status: "pending",
      createdDaysAgo: 2,
    },
    {
      applicantUserId: emp3.id,
      title: "Figmaチーム年額プラン",
      amountYen: 180000,
      childCategoryId: childCat(7),
      desiredPurchaseDate: daysFromNow(14),
      status: "pending",
      createdDaysAgo: 3,
    },
    {
      applicantUserId: emp1.id,
      title: "リファクタリング(第2版)",
      amountYen: 4400,
      childCategoryId: childCat(9),
      desiredPurchaseDate: null,
      status: "pending",
      createdDaysAgo: 4,
    },
    {
      applicantUserId: emp2.id,
      title: "ロジクール MX Master 3S",
      amountYen: 14800,
      childCategoryId: childCat(2),
      desiredPurchaseDate: daysFromNow(3),
      status: "pending",
      createdDaysAgo: 5,
    },
    {
      applicantUserId: emp1.id,
      title: "ノートPC用スタンド",
      amountYen: 7800,
      childCategoryId: childCat(1),
      desiredPurchaseDate: daysFromNow(5),
      status: "approved",
      createdDaysAgo: 10,
    },
    {
      applicantUserId: emp2.id,
      title: "ホワイトボード(壁掛け)",
      amountYen: 12000,
      childCategoryId: childCat(10),
      desiredPurchaseDate: null,
      status: "approved",
      createdDaysAgo: 12,
    },
    {
      applicantUserId: emp3.id,
      title: "ボールペン詰め合わせ",
      amountYen: 2400,
      childCategoryId: childCat(3),
      desiredPurchaseDate: null,
      status: "approved",
      createdDaysAgo: 14,
    },
    {
      applicantUserId: emp1.id,
      title: "JetBrains All Products Pack",
      amountYen: 89000,
      childCategoryId: childCat(6),
      desiredPurchaseDate: null,
      status: "approved",
      createdDaysAgo: 16,
    },
    {
      applicantUserId: emp2.id,
      title: "GitHub Copilot Business",
      amountYen: 24000,
      childCategoryId: childCat(8),
      desiredPurchaseDate: null,
      status: "approved",
      createdDaysAgo: 18,
    },
    {
      applicantUserId: emp3.id,
      title: "USB-Cハブ",
      amountYen: 6800,
      childCategoryId: childCat(0),
      desiredPurchaseDate: null,
      status: "approved",
      createdDaysAgo: 20,
    },
    {
      applicantUserId: emp1.id,
      title: "オフィスチェア交換",
      amountYen: 45000,
      childCategoryId: childCat(5),
      desiredPurchaseDate: null,
      status: "approved",
      createdDaysAgo: 22,
    },
    {
      applicantUserId: emp2.id,
      title: "ゲーミングPC",
      amountYen: 350000,
      childCategoryId: childCat(0),
      desiredPurchaseDate: null,
      status: "rejected",
      createdDaysAgo: 24,
    },
    {
      applicantUserId: emp3.id,
      title: "高級デスク(木製)",
      amountYen: 280000,
      childCategoryId: childCat(4),
      desiredPurchaseDate: null,
      status: "rejected",
      createdDaysAgo: 26,
    },
    {
      applicantUserId: emp1.id,
      title: "個人サブスク(動画配信)",
      amountYen: 1980,
      childCategoryId: childCat(8),
      desiredPurchaseDate: null,
      status: "rejected",
      createdDaysAgo: 28,
    },
  ] as const satisfies readonly PurchaseRequestSpec[];

  const requestValues: PurchaseRequestInsert[] = specs.map((spec) => {
    const createdAt = daysAgo(spec.createdDaysAgo);
    const updatedAt =
      spec.status === "pending"
        ? createdAt
        : new Date(createdAt.getTime() + DAY_MS);
    return {
      applicantUserId: spec.applicantUserId,
      title: spec.title,
      amountYen: spec.amountYen,
      childCategoryId: spec.childCategoryId,
      desiredPurchaseDate: spec.desiredPurchaseDate,
      status: spec.status,
      createdAt,
      updatedAt,
    };
  });

  const insertedRequests = await db
    .insert(purchaseRequests)
    .values(requestValues)
    .returning();

  const historyValues: ApprovalHistoryInsert[] = [];
  for (const req of insertedRequests) {
    historyValues.push({
      purchaseRequestId: req.id,
      actorUserId: req.applicantUserId,
      kind: "created",
      occurredAt: req.createdAt,
      comment: null,
    });
    if (req.status === "approved") {
      historyValues.push({
        purchaseRequestId: req.id,
        actorUserId: admin.id,
        kind: "approved",
        occurredAt: req.updatedAt,
        comment: null,
      });
    } else if (req.status === "rejected") {
      historyValues.push({
        purchaseRequestId: req.id,
        actorUserId: admin.id,
        kind: "rejected",
        occurredAt: req.updatedAt,
        comment: rejectionComment(req.title),
      });
    }
  }

  await db.insert(approvalHistories).values(historyValues);

  console.log(`  users:               4`);
  console.log(`  parent_categories:   4`);
  console.log(`  child_categories:    ${childCatRows.length}`);
  console.log(`  purchase_requests:   ${insertedRequests.length}`);
  console.log(`  approval_histories:  ${historyValues.length}`);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
