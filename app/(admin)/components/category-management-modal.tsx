"use client";

import { Modal } from "@mantine/core";
import type { CategoryGroup } from "@/app/server/data/categories";
import { AdminParentCategoryList } from "./admin-parent-category-list";

type Props = {
  opened: boolean;
  onClose: () => void;
  categories: CategoryGroup[];
};

export function CategoryManagementModal({
  opened,
  onClose,
  categories,
}: Props) {
  return (
    <Modal
      centered
      onClose={onClose}
      opened={opened}
      size="md"
      title="カテゴリ管理"
    >
      <AdminParentCategoryList categories={categories} />
    </Modal>
  );
}
