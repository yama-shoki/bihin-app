"use client";

import { Combobox, InputBase, Loader, useCombobox } from "@mantine/core";
import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/app/lib/client-notifications";
import { addChildCategory } from "@/app/server/actions/categories";
import type { CategoryGroup } from "@/app/server/data/categories";
import type { ChildCategory } from "@/db/types";

// * Combobox.Option の value 用センチネル。子カテゴリ id (UUID) と衝突しない値で「新規追加」アクションを表す。
const ADD_OPTION_VALUE = "__add__";

type Props = {
  categories: CategoryGroup[];
  parentCategoryId: string | null;
  value: ChildCategory["id"];
  onChange: (childCategoryId: ChildCategory["id"]) => void;
  error?: ReactNode;
  disabled?: boolean;
};

export function ChildCategoryCombobox({
  categories,
  parentCategoryId,
  value,
  onChange,
  error,
  disabled = false,
}: Props) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const parentGroup = categories.find(
    (group) => group.parent.id === parentCategoryId,
  );
  const children = parentGroup?.children ?? [];
  const selectedChild = children.find((child) => child.id === value);
  const trimmedSearch = search.trim();
  const normalizedSearch = trimmedSearch.toLowerCase();
  const filteredChildren = normalizedSearch
    ? children.filter((child) =>
        child.name.toLowerCase().includes(normalizedSearch),
      )
    : children;
  const hasExactMatch = children.some((child) => child.name === trimmedSearch);
  const showAddOption = trimmedSearch.length > 0 && !hasExactMatch;
  const inputDisabled = disabled || !parentCategoryId;
  const inputValue = selectedChild ? selectedChild.name : search;

  const handleAddCategory = () => {
    if (!parentCategoryId || trimmedSearch.length === 0) {
      return;
    }

    const name = trimmedSearch;
    startTransition(async () => {
      const result = await addChildCategory({ parentCategoryId, name });

      if (result.ok) {
        onChange(result.data.childCategoryId);
        setSearch("");
        combobox.closeDropdown();
        showSuccessNotification("カテゴリを追加しました");
        return;
      }

      showErrorNotification(
        result.error.kind === "CONFLICT"
          ? "同名カテゴリが既に存在します"
          : result.error.message,
      );
    });
  };

  return (
    <Combobox
      disabled={inputDisabled}
      onOptionSubmit={(optionValue) => {
        if (optionValue === ADD_OPTION_VALUE) {
          handleAddCategory();
          return;
        }

        onChange(optionValue);
        setSearch("");
        combobox.closeDropdown();
      }}
      store={combobox}
    >
      <Combobox.Target>
        <InputBase
          disabled={inputDisabled}
          error={error}
          label="子カテゴリ"
          onBlur={() => combobox.closeDropdown()}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            onChange("");
            combobox.openDropdown();
          }}
          onClick={() => {
            if (parentCategoryId) {
              combobox.openDropdown();
            }
          }}
          placeholder={
            parentCategoryId
              ? "選択または入力で新規追加"
              : "親カテゴリを先に選んでください"
          }
          required
          rightSection={isPending ? <Loader size={16} /> : <Combobox.Chevron />}
          rightSectionPointerEvents="none"
          value={inputValue}
        />
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>
          {filteredChildren.map((child) => (
            <Combobox.Option key={child.id} value={child.id}>
              {child.name}
            </Combobox.Option>
          ))}
          {showAddOption ? (
            <Combobox.Option disabled={isPending} value={ADD_OPTION_VALUE}>
              + 「{trimmedSearch}」を新規追加
            </Combobox.Option>
          ) : null}
          {filteredChildren.length === 0 && !showAddOption ? (
            <Combobox.Empty>該当するカテゴリがありません</Combobox.Empty>
          ) : null}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
