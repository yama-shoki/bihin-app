"use client";

import { Select } from "@mantine/core";
import type { CategoryGroup } from "@/app/server/data/categories";

type Props = {
  categories: CategoryGroup[];
  value: string | null;
  onChange: (value: string | null) => void;
};

export function PurchaseRequestCategoryFilter({
  categories,
  value,
  onChange,
}: Props) {
  return (
    <Select
      clearable
      data={categories.map((group) => ({
        value: group.parent.id,
        label: group.parent.name,
      }))}
      nothingFoundMessage="カテゴリが見つかりません"
      onChange={onChange}
      placeholder="カテゴリで絞り込み"
      searchable
      value={value}
      w={{ base: "100%", sm: 240 }}
    />
  );
}
