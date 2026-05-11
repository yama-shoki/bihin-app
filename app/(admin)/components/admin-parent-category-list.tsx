"use client";

import { Button, Stack } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/app/lib/client-notifications";
import {
  addParentCategory,
  deleteParentCategory,
  updateParentCategory,
} from "@/app/server/actions/categories";
import type { CategoryGroup } from "@/app/server/data/categories";
import type { ParentCategory } from "@/db/types";
import {
  ParentConfirmingDeleteRow,
  ParentEditingRow,
  ParentRow,
} from "./admin-parent-category-rows";

type RowMode =
  | { kind: "idle" }
  | { kind: "editing"; parentId: ParentCategory["id"] }
  | { kind: "confirmingDelete"; parentId: ParentCategory["id"] }
  | { kind: "creating" };

type Props = {
  categories: CategoryGroup[];
};

export function AdminParentCategoryList({ categories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rowMode, setRowMode] = useState<RowMode>({ kind: "idle" });

  const handleAdd = (name: ParentCategory["name"]) => {
    startTransition(async () => {
      const result = await addParentCategory({ name });
      if (result.ok) {
        showSuccessNotification(`「${name}」を追加しました`);
        setRowMode({ kind: "idle" });
        router.refresh();
        return;
      }
      showErrorNotification(result.error.message);
    });
  };

  const handleUpdate = (
    parentId: ParentCategory["id"],
    name: ParentCategory["name"],
  ) => {
    startTransition(async () => {
      const result = await updateParentCategory({
        parentCategoryId: parentId,
        name,
      });
      if (result.ok) {
        showSuccessNotification("親カテゴリを更新しました");
        setRowMode({ kind: "idle" });
        router.refresh();
        return;
      }
      showErrorNotification(result.error.message);
    });
  };

  const handleDelete = (parentId: ParentCategory["id"]) => {
    startTransition(async () => {
      const result = await deleteParentCategory({ parentCategoryId: parentId });
      if (result.ok) {
        showSuccessNotification("親カテゴリを削除しました");
        setRowMode({ kind: "idle" });
        router.refresh();
        return;
      }
      showErrorNotification(result.error.message);
      setRowMode({ kind: "idle" });
    });
  };

  return (
    <Stack gap="sm">
      {categories.map((group) => {
        const parent = group.parent;
        if (rowMode.kind === "editing" && rowMode.parentId === parent.id) {
          return (
            <ParentEditingRow
              initialName={parent.name}
              isPending={isPending}
              key={parent.id}
              onCancel={() => setRowMode({ kind: "idle" })}
              onSubmit={(name) => handleUpdate(parent.id, name)}
            />
          );
        }
        if (
          rowMode.kind === "confirmingDelete" &&
          rowMode.parentId === parent.id
        ) {
          return (
            <ParentConfirmingDeleteRow
              isPending={isPending}
              key={parent.id}
              onCancel={() => setRowMode({ kind: "idle" })}
              onConfirm={() => handleDelete(parent.id)}
              parentName={parent.name}
            />
          );
        }
        return (
          <ParentRow
            childCategories={group.children}
            disabled={isPending || rowMode.kind === "creating"}
            key={parent.id}
            onEdit={() => setRowMode({ kind: "editing", parentId: parent.id })}
            onRequestDelete={() =>
              setRowMode({ kind: "confirmingDelete", parentId: parent.id })
            }
            parent={parent}
          />
        );
      })}
      {rowMode.kind === "creating" ? (
        <ParentEditingRow
          initialName=""
          isPending={isPending}
          onCancel={() => setRowMode({ kind: "idle" })}
          onSubmit={(name) => handleAdd(name)}
        />
      ) : (
        <Button
          disabled={isPending || rowMode.kind !== "idle"}
          leftSection={<IconPlus size={14} />}
          onClick={() => setRowMode({ kind: "creating" })}
          size="xs"
          variant="light"
        >
          親カテゴリを追加
        </Button>
      )}
    </Stack>
  );
}
