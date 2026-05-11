import { eq } from "drizzle-orm";
import { seed } from "drizzle-seed";
import { db } from "./index";
import {
  approvalHistories,
  childCategories,
  parentCategories,
  purchaseRequests,
  users,
} from "./schema";
import type { ApprovalHistoryInsert } from "./types";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SEED_REQUEST_COUNT = 100;
// 同じ seed 値で実行すると同じ分布を再現
const RANDOM_SEED = 20260511;

const REQUEST_TITLE_SAMPLES = [
  "27インチ4Kモニター",
  "メカニカルキーボード",
  "ワイヤレスマウス",
  "USB-Cハブ",
  "ノートPCスタンド",
  "ウェブカメラ",
  "ヘッドセット",
  "外付けSSD 1TB",
  "外付けキーボードカバー",
  "オフィスチェア交換",
  "昇降式デスク",
  "デスクライト",
  "ホワイトボード",
  "A4コピー用紙(500枚)",
  "高機能ボールペン10本セット",
  "シュレッダー",
  "プロジェクター",
  "GitHub Copilot Business",
  "Figmaチーム年額プラン",
  "Notionチームプラン",
  "Slack Business+",
  "1Password Teams",
  "Linear Standard",
  "Vercel Pro",
  "Datadog Pro",
  "技術書3冊セット",
  "デザイン書籍",
  "リファレンスマニュアル",
  "ノイズキャンセリングイヤホン",
  "モバイルバッテリー",
];

const REJECTION_COMMENT_SAMPLES = [
  "業務関連性が明確でないため、利用目的を再整理してから申請してください。",
  "予算上限を超えているため、代替案の検討をお願いします。",
  "同等機能の既存資産があるため、利用調整を先にお願いします。",
  "他部署と共有可能か確認後、再申請してください。",
];

function randomFromArray<T>(samples: readonly T[]): T | undefined {
  return samples[Math.floor(Math.random() * samples.length)];
}

async function main(): Promise<void> {
  console.log("Seeding database...");

  await db.delete(approvalHistories);
  await db.delete(purchaseRequests);
  await db.delete(childCategories);
  await db.delete(parentCategories);
  await db.delete(users);

  const [adminUser, satoEmployee, suzukiEmployee, takahashiEmployee] = await db
    .insert(users)
    .values([
      { name: "山田 太郎", department: "総務部", role: "admin" },
      { name: "佐藤 花子", department: "開発部", role: "employee" },
      { name: "鈴木 一郎", department: "営業部", role: "employee" },
      { name: "高橋 美咲", department: "デザイン部", role: "employee" },
    ])
    .returning();

  if (!adminUser || !satoEmployee || !suzukiEmployee || !takahashiEmployee) {
    throw new Error("Failed to insert users");
  }

  const [
    pcParentCategory,
    officeParentCategory,
    softwareParentCategory,
    otherParentCategory,
  ] = await db
    .insert(parentCategories)
    .values([
      { name: "PC周辺機器" },
      { name: "オフィス用品" },
      { name: "ソフトウェア" },
      { name: "その他" },
    ])
    .returning();

  if (
    !pcParentCategory ||
    !officeParentCategory ||
    !softwareParentCategory ||
    !otherParentCategory
  ) {
    throw new Error("Failed to insert parent categories");
  }

  const insertedChildCategories = await db
    .insert(childCategories)
    .values([
      { parentCategoryId: pcParentCategory.id, name: "モニター" },
      { parentCategoryId: pcParentCategory.id, name: "キーボード" },
      { parentCategoryId: pcParentCategory.id, name: "マウス" },
      { parentCategoryId: officeParentCategory.id, name: "文房具" },
      { parentCategoryId: officeParentCategory.id, name: "デスク" },
      { parentCategoryId: officeParentCategory.id, name: "椅子" },
      { parentCategoryId: softwareParentCategory.id, name: "開発ツール" },
      { parentCategoryId: softwareParentCategory.id, name: "デザインツール" },
      { parentCategoryId: softwareParentCategory.id, name: "SaaSサブスク" },
      { parentCategoryId: otherParentCategory.id, name: "書籍" },
      { parentCategoryId: otherParentCategory.id, name: "その他" },
    ])
    .returning();

  const employeeUserIds = [
    satoEmployee.id,
    suzukiEmployee.id,
    takahashiEmployee.id,
  ];
  const childCategoryIds = insertedChildCategories.map(
    (childCategory) => childCategory.id,
  );
  const seededAt = Date.now();
  const past90DaysStart = new Date(seededAt - 90 * ONE_DAY_MS);

  // @ts-expect-error -- drizzle-seed 0.3 の db 引数型が schema-less を要求するが実装は schema 付きでも動く
  await seed(db, { purchaseRequests }, { seed: RANDOM_SEED }).refine(
    (generators) => ({
      purchaseRequests: {
        count: SEED_REQUEST_COUNT,
        columns: {
          title: generators.valuesFromArray({ values: REQUEST_TITLE_SAMPLES }),
          amountYen: generators.int({ minValue: 1000, maxValue: 250000 }),
          applicantUserId: generators.valuesFromArray({
            values: employeeUserIds,
          }),
          childCategoryId: generators.valuesFromArray({
            values: childCategoryIds,
          }),
          status: generators.weightedRandom([
            {
              weight: 0.45,
              value: generators.default({ defaultValue: "pending" }),
            },
            {
              weight: 0.28,
              value: generators.default({ defaultValue: "approved" }),
            },
            {
              weight: 0.17,
              value: generators.default({ defaultValue: "rejected" }),
            },
            {
              weight: 0.1,
              value: generators.default({ defaultValue: "withdrawn" }),
            },
          ]),
          createdAt: generators.date({
            minDate: past90DaysStart,
            maxDate: new Date(seededAt),
          }),
        },
      },
    }),
  );

  const insertedRequests = await db.select().from(purchaseRequests);
  for (const [index, request] of insertedRequests.entries()) {
    const applicantUserId =
      employeeUserIds[index % employeeUserIds.length] ?? satoEmployee.id;
    const desiredPurchaseDate =
      index % 3 === 0
        ? new Date(seededAt + Math.floor(Math.random() * 60 * ONE_DAY_MS))
        : null;
    await db
      .update(purchaseRequests)
      .set({ applicantUserId, desiredPurchaseDate })
      .where(eq(purchaseRequests.id, request.id));
  }

  const finalRequests = await db.select().from(purchaseRequests);
  const historyValues: ApprovalHistoryInsert[] = [];
  for (const request of finalRequests) {
    historyValues.push({
      purchaseRequestId: request.id,
      actorUserId: request.applicantUserId,
      kind: "created",
      occurredAt: request.createdAt,
      comment: null,
    });

    if (request.status === "approved" || request.status === "rejected") {
      const decisionDelayDays = 1 + Math.floor(Math.random() * 9);
      const decidedAt = new Date(
        request.createdAt.getTime() + decisionDelayDays * ONE_DAY_MS,
      );
      historyValues.push({
        purchaseRequestId: request.id,
        actorUserId: adminUser.id,
        kind: request.status,
        occurredAt: decidedAt,
        comment:
          request.status === "rejected"
            ? (randomFromArray(REJECTION_COMMENT_SAMPLES) ?? null)
            : null,
      });
    } else if (request.status === "withdrawn") {
      const withdrawDelayDays = 1 + Math.floor(Math.random() * 4);
      const withdrawnAt = new Date(
        request.createdAt.getTime() + withdrawDelayDays * ONE_DAY_MS,
      );
      historyValues.push({
        purchaseRequestId: request.id,
        actorUserId: request.applicantUserId,
        kind: "withdrawn",
        occurredAt: withdrawnAt,
        comment: null,
      });
    }
  }
  await db.insert(approvalHistories).values(historyValues);

  console.log(`  users:               4`);
  console.log(`  parent_categories:   4`);
  console.log(`  child_categories:    ${insertedChildCategories.length}`);
  console.log(`  purchase_requests:   ${finalRequests.length}`);
  console.log(`  approval_histories:  ${historyValues.length}`);
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
