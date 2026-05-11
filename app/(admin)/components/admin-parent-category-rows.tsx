"use client";

import {
  ActionIcon,
  Button,
  Group,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { IconCheck, IconPencil, IconTrash, IconX } from "@tabler/icons-react";
import { useState } from "react";
import type { CategoryGroup } from "@/app/server/data/categories";
import type { ParentCategory } from "@/db/types";
import { AdminChildCategoryCombobox } from "./admin-child-category-combobox";

type ParentRowProps = {
  parent: Pick<ParentCategory, "id" | "name">;
  childCategories: CategoryGroup["children"];
  disabled: boolean;
  onEdit: () => void;
  onRequestDelete: () => void;
};

export function ParentRow({
  parent,
  childCategories,
  disabled,
  onEdit,
  onRequestDelete,
}: ParentRowProps) {
  return (
    <Group gap="xs" justify="space-between" wrap="nowrap">
      <Text flex={1} fw={600} miw={0} size="sm" truncate>
        {parent.name}
      </Text>
      <Group gap={2} wrap="nowrap">
        <Tooltip label="親カテゴリ名を編集" withArrow>
          <ActionIcon
            aria-label={`${parent.name} を編集`}
            color="blue"
            disabled={disabled}
            onClick={onEdit}
            variant="subtle"
          >
            <IconPencil size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="親カテゴリを削除" withArrow>
          <ActionIcon
            aria-label={`${parent.name} を削除`}
            color="red"
            disabled={disabled}
            onClick={onRequestDelete}
            variant="subtle"
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Tooltip>
        <AdminChildCategoryCombobox
          childCategories={childCategories}
          parentCategory={parent}
        />
      </Group>
    </Group>
  );
}

type ParentEditingRowProps = {
  initialName: string;
  isPending: boolean;
  onSubmit: (name: string) => void;
  onCancel: () => void;
};

export function ParentEditingRow({
  initialName,
  isPending,
  onSubmit,
  onCancel,
}: ParentEditingRowProps) {
  const [draftName, setDraftName] = useState(initialName);
  const trimmed = draftName.trim();
  const isDirty = trimmed.length > 0 && trimmed !== initialName;

  return (
    <Group gap="xs" wrap="nowrap">
      <TextInput
        autoFocus
        disabled={isPending}
        flex={1}
        onChange={(event) => setDraftName(event.currentTarget.value)}
        onKeyDown={(event) => {
          // * IME 変換中の Enter は確定操作。送信トリガーとして拾わない。
          if (event.nativeEvent.isComposing || event.key === "Process") {
            return;
          }
          if (event.key === "Enter" && isDirty) {
            event.preventDefault();
            onSubmit(trimmed);
          }
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          }
        }}
        placeholder="親カテゴリ名を入力"
        size="sm"
        value={draftName}
      />
      <Group gap={2} wrap="nowrap">
        <Tooltip label="保存 (Enter)" withArrow>
          <ActionIcon
            aria-label="保存"
            color="blue"
            disabled={!isDirty || isPending}
            loading={isPending}
            onClick={() => onSubmit(trimmed)}
            variant="filled"
          >
            <IconCheck size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="キャンセル (Esc)" withArrow>
          <ActionIcon
            aria-label="キャンセル"
            disabled={isPending}
            onClick={onCancel}
            variant="subtle"
          >
            <IconX size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  );
}

type ParentConfirmingDeleteRowProps = {
  parentName: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ParentConfirmingDeleteRow({
  parentName,
  isPending,
  onConfirm,
  onCancel,
}: ParentConfirmingDeleteRowProps) {
  return (
    <Group
      bg="var(--mantine-color-red-0)"
      gap="xs"
      justify="space-between"
      px="sm"
      py={6}
      wrap="nowrap"
    >
      <Text c="red.9" flex={1} size="sm">
        「{parentName}」を削除しますか？
      </Text>
      <Group gap={4} wrap="nowrap">
        <Button
          disabled={isPending}
          onClick={onCancel}
          size="compact-xs"
          variant="default"
        >
          キャンセル
        </Button>
        <Button
          color="red"
          disabled={isPending}
          loading={isPending}
          onClick={onConfirm}
          size="compact-xs"
        >
          削除
        </Button>
      </Group>
    </Group>
  );
}
