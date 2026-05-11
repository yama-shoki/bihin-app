"use client";

import { Button, Combobox, useCombobox } from "@mantine/core";
import { IconChevronDown, IconPlus, IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useState, useTransition } from "react";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/app/lib/client-notifications";
import {
  addChildCategory,
  deleteChildCategory,
  updateChildCategory,
} from "@/app/server/actions/categories";
import type { ChildCategory, ParentCategory } from "@/db/types";
import {
  ChildCategoryRow,
  ConfirmingDeleteRow,
  EditingRow,
} from "./admin-child-category-rows";

type Props = {
  parentCategory: Pick<ParentCategory, "id" | "name">;
  childCategories: Pick<ChildCategory, "id" | "name">[];
};

type RowMode =
  | { kind: "idle" }
  | { kind: "editing"; childId: ChildCategory["id"] }
  | { kind: "confirmingDelete"; childId: ChildCategory["id"] };

export function AdminChildCategoryCombobox({
  parentCategory,
  childCategories,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState("");
  const [rowMode, setRowMode] = useState<RowMode>({ kind: "idle" });

  const combobox = useCombobox({
    onDropdownOpen: () => combobox.focusSearchInput(),
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      setSearchValue("");
      setRowMode({ kind: "idle" });
    },
  });

  const trimmedSearch = searchValue.trim();
  const filteredChildCategories = trimmedSearch
    ? childCategories.filter((child) =>
        child.name.toLowerCase().includes(trimmedSearch.toLowerCase()),
      )
    : childCategories;
  const exactMatch = childCategories.some(
    (child) => child.name === trimmedSearch,
  );
  const canCreate = trimmedSearch.length > 0 && !exactMatch;

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.currentTarget.value);
    combobox.resetSelectedOption();
  };

  const handleCreate = () => {
    startTransition(async () => {
      const result = await addChildCategory({
        parentCategoryId: parentCategory.id,
        name: trimmedSearch,
      });
      if (result.ok) {
        showSuccessNotification(`「${trimmedSearch}」を追加しました`);
        setSearchValue("");
        router.refresh();
        return;
      }
      showErrorNotification(result.error.message);
    });
  };

  const handleUpdate = (childId: ChildCategory["id"], name: string) => {
    startTransition(async () => {
      const result = await updateChildCategory({
        childCategoryId: childId,
        name,
      });
      if (result.ok) {
        showSuccessNotification("カテゴリを更新しました");
        setRowMode({ kind: "idle" });
        router.refresh();
        return;
      }
      showErrorNotification(result.error.message);
    });
  };

  const handleDelete = (childId: ChildCategory["id"]) => {
    startTransition(async () => {
      const result = await deleteChildCategory({ childCategoryId: childId });
      if (result.ok) {
        showSuccessNotification("カテゴリを削除しました");
        setRowMode({ kind: "idle" });
        router.refresh();
        return;
      }
      showErrorNotification(result.error.message);
      setRowMode({ kind: "idle" });
    });
  };

  return (
    <Combobox position="bottom-end" store={combobox} width={280}>
      <Combobox.Target>
        <Button
          onClick={() => combobox.toggleDropdown()}
          rightSection={<IconChevronDown size={14} />}
          size="xs"
          variant="default"
        >
          子カテゴリ {childCategories.length}
        </Button>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Search
          leftSection={<IconSearch size={14} />}
          onChange={handleSearchChange}
          placeholder="検索 or 新しいカテゴリ名を入力"
          value={searchValue}
        />
        <Combobox.Options>
          {filteredChildCategories.length === 0 && !canCreate ? (
            <Combobox.Empty>カテゴリがありません</Combobox.Empty>
          ) : (
            filteredChildCategories.map((child) => {
              if (rowMode.kind === "editing" && rowMode.childId === child.id) {
                return (
                  <EditingRow
                    initialName={child.name}
                    isPending={isPending}
                    key={child.id}
                    onCancel={() => setRowMode({ kind: "idle" })}
                    onSubmit={(nextName) => handleUpdate(child.id, nextName)}
                  />
                );
              }
              if (
                rowMode.kind === "confirmingDelete" &&
                rowMode.childId === child.id
              ) {
                return (
                  <ConfirmingDeleteRow
                    childName={child.name}
                    isPending={isPending}
                    key={child.id}
                    onCancel={() => setRowMode({ kind: "idle" })}
                    onConfirm={() => handleDelete(child.id)}
                  />
                );
              }
              return (
                <ChildCategoryRow
                  child={child}
                  disabled={isPending}
                  key={child.id}
                  onEdit={() =>
                    setRowMode({ kind: "editing", childId: child.id })
                  }
                  onRequestDelete={() =>
                    setRowMode({ kind: "confirmingDelete", childId: child.id })
                  }
                />
              );
            })
          )}
        </Combobox.Options>

        {canCreate ? (
          <Combobox.Footer>
            <Button
              fullWidth
              leftSection={<IconPlus size={14} />}
              loading={isPending}
              onClick={handleCreate}
              size="xs"
              variant="light"
            >
              「{trimmedSearch}」を追加
            </Button>
          </Combobox.Footer>
        ) : null}
      </Combobox.Dropdown>
    </Combobox>
  );
}
