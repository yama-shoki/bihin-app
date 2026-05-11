"use client";

import {
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { z } from "zod";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/app/lib/client-notifications";
import {
  getJapaneseHolidayName,
  isJapaneseHoliday,
} from "@/app/lib/jp-holiday";
import {
  createPurchaseRequest,
  updatePurchaseRequest,
} from "@/app/server/actions/purchase-requests";
import type { CategoryGroup } from "@/app/server/data/categories";
import type { PurchaseRequest } from "@/db/types";
import type { createPurchaseRequestSchema } from "@/db/zod/purchase-request";
import { ChildCategoryCombobox } from "./child-category-combobox";

// Server に送る payload 形状は zod schema から派生 = 型ドリフトを構造的に防ぐ。
type PurchaseRequestPayload = z.infer<typeof createPurchaseRequestSchema>;

// Form は親カテゴリ Select の制御 (parentCategoryId)、NumberInput の空状態 ("")、
// Mantine 9 DateInput の string 値を扱う必要がある。
// schema の payload を再利用しつつ UI 都合の差分だけを上書きする。
export type PurchaseRequestFormValues = Omit<
  PurchaseRequestPayload,
  "amountYen" | "desiredPurchaseDate"
> & {
  amountYen: number | "";
  parentCategoryId: string | null;
  desiredPurchaseDate: string | null;
};

type FormValues = PurchaseRequestFormValues;

type CreateProps = {
  mode: "create";
  categories: CategoryGroup[];
};

type EditProps = {
  mode: "edit";
  categories: CategoryGroup[];
  purchaseRequestId: PurchaseRequest["id"];
  initialValues: FormValues;
};

type Props = CreateProps | EditProps;

export function PurchaseRequestForm(props: Props) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const detailHref = isEdit
    ? (`/requests/${props.purchaseRequestId}` as Route)
    : ("/requests" as Route);

  const form = useForm<FormValues>({
    initialValues: isEdit
      ? props.initialValues
      : {
          title: "",
          amountYen: "",
          parentCategoryId: null,
          childCategoryId: "",
          desiredPurchaseDate: null,
        },
    validate: {
      title: (value) =>
        value.trim().length === 0
          ? "タイトルを入力してください"
          : value.length > 100
            ? "タイトルは100文字以内で入力してください"
            : null,
      amountYen: (value) =>
        typeof value !== "number" || value <= 0
          ? "金額は1円以上で入力してください"
          : null,
      parentCategoryId: (value) =>
        value ? null : "カテゴリを選択してください",
      childCategoryId: (value) =>
        value ? null : "子カテゴリを選択してください",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    if (typeof values.amountYen !== "number") {
      return;
    }
    // * Mantine DateInput は YYYY-MM-DD の string を返す。schema は Date を要求するので変換。
    const desiredPurchaseDate = values.desiredPurchaseDate
      ? new Date(values.desiredPurchaseDate)
      : null;
    const amountYen = values.amountYen;
    const result = isEdit
      ? await updatePurchaseRequest({
          purchaseRequestId: props.purchaseRequestId,
          title: values.title.trim(),
          amountYen,
          childCategoryId: values.childCategoryId,
          desiredPurchaseDate,
        })
      : await createPurchaseRequest({
          title: values.title.trim(),
          amountYen,
          childCategoryId: values.childCategoryId,
          desiredPurchaseDate,
        });

    if (result.ok) {
      showSuccessNotification(
        isEdit ? "申請を更新しました" : "申請を作成しました",
      );
      router.push(detailHref);
      router.refresh();
      return;
    }

    if (isEdit && result.error.kind === "CONFLICT") {
      showErrorNotification(result.error.message);
      router.push(detailHref);
      router.refresh();
      return;
    }

    if (result.error.kind === "VALIDATION" && result.error.fieldErrors) {
      form.setErrors(
        Object.fromEntries(
          Object.entries(result.error.fieldErrors)
            .map(([field, messages]) => [field, messages[0]])
            .filter(([, message]) => Boolean(message)),
        ),
      );
    }

    showErrorNotification(result.error.message);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        <Card padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Stack gap={2}>
              <Title order={4}>基本情報</Title>
              <Text c="dimmed" size="sm">
                何をいくらで購入したいかを入力してください
              </Text>
            </Stack>
            <Divider />
            <TextInput
              description="100文字以内で記入"
              disabled={form.submitting}
              label="タイトル"
              placeholder="例: 27インチ4Kモニター"
              withAsterisk
              {...form.getInputProps("title")}
            />
            <NumberInput
              description="税込価格を入力"
              disabled={form.submitting}
              hideControls
              label="金額(円)"
              min={1}
              placeholder="例: 10000"
              thousandSeparator=","
              withAsterisk
              {...form.getInputProps("amountYen")}
            />
          </Stack>
        </Card>

        <Card padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Stack gap={2}>
              <Title order={4}>分類</Title>
              <Text c="dimmed" size="sm">
                カテゴリを 2
                段階で選んでください。子カテゴリは入力で新規追加できます
              </Text>
            </Stack>
            <Divider />
            <Select
              data={props.categories.map((group) => ({
                label: group.parent.name,
                value: group.parent.id,
              }))}
              disabled={form.submitting}
              label="親カテゴリ"
              onChange={(value) => {
                form.setFieldValue("parentCategoryId", value);
                form.setFieldValue("childCategoryId", "");
              }}
              placeholder="親カテゴリを選択"
              searchable
              value={form.values.parentCategoryId}
              withAsterisk
            />
            <ChildCategoryCombobox
              categories={props.categories}
              disabled={form.submitting}
              error={form.errors.childCategoryId}
              onChange={(value) => form.setFieldValue("childCategoryId", value)}
              parentCategoryId={form.values.parentCategoryId}
              value={form.values.childCategoryId}
            />
          </Stack>
        </Card>

        <Card padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Stack gap={2}>
              <Title order={4}>補足</Title>
              <Text c="dimmed" size="sm">
                必要であれば希望購入日を指定してください
              </Text>
            </Stack>
            <Divider />
            <DateInput
              clearable
              description="任意。指定があれば入力してください"
              disabled={form.submitting}
              getDayProps={(date) => {
                const d = new Date(date);
                if (!isJapaneseHoliday(d)) {
                  return {};
                }
                return {
                  style: { color: "var(--mantine-color-red-6)" },
                  title: getJapaneseHolidayName(d) ?? undefined,
                };
              }}
              label="希望購入日"
              placeholder="日付を選択"
              valueFormat="YYYY年M月D日 (ddd)"
              {...form.getInputProps("desiredPurchaseDate")}
            />
          </Stack>
        </Card>

        <Group gap="sm" justify="flex-end">
          <Button
            component={Link}
            disabled={form.submitting}
            href={detailHref}
            variant="default"
          >
            キャンセル
          </Button>
          <Button
            disabled={form.submitting}
            loading={form.submitting}
            type="submit"
          >
            {isEdit ? "更新する" : "申請する"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
