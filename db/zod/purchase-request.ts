import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { purchaseRequests } from "../schema/purchase-requests";

export const purchaseRequestInsertSchema = createInsertSchema(
  purchaseRequests,
  {
    title: (fieldSchema) =>
      fieldSchema
        .min(1, "タイトルを入力してください")
        .max(100, "タイトルは100文字以内で入力してください"),
    amountYen: (fieldSchema) =>
      fieldSchema.int().positive("金額は1円以上で入力してください"),
  },
);

// * applicantUserId はセッションから補完、id/status/timestamps は DB 任せ
export const createPurchaseRequestSchema = purchaseRequestInsertSchema.pick({
  title: true,
  amountYen: true,
  childCategoryId: true,
  desiredPurchaseDate: true,
});

export const approvePurchaseRequestSchema = z.object({
  purchaseRequestId: z.string().min(1),
});

export const rejectPurchaseRequestSchema = z.object({
  purchaseRequestId: z.string().min(1),
  comment: z
    .string()
    .trim()
    .min(1, "却下理由を入力してください")
    .max(500, "却下理由は500文字以内で入力してください"),
});
