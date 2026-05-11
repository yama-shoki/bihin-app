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
import type { ChildCategory } from "@/db/types";

type ChildCategoryRowProps = {
  child: Pick<ChildCategory, "id" | "name">;
  disabled: boolean;
  onEdit: () => void;
  onRequestDelete: () => void;
};

export function ChildCategoryRow({
  child,
  disabled,
  onEdit,
  onRequestDelete,
}: ChildCategoryRowProps) {
  return (
    <Group gap="xs" justify="space-between" px="sm" py={6} wrap="nowrap">
      <Text flex={1} size="sm">
        {child.name}
      </Text>
      <Group gap={2} wrap="nowrap">
        <Tooltip label="編集" withArrow>
          <ActionIcon
            aria-label={`${child.name} を編集`}
            color="blue"
            disabled={disabled}
            onClick={onEdit}
            variant="subtle"
          >
            <IconPencil size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="削除" withArrow>
          <ActionIcon
            aria-label={`${child.name} を削除`}
            color="red"
            disabled={disabled}
            onClick={onRequestDelete}
            variant="subtle"
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  );
}

type EditingRowProps = {
  initialName: ChildCategory["name"];
  isPending: boolean;
  onSubmit: (nextName: ChildCategory["name"]) => void;
  onCancel: () => void;
};

export function EditingRow({
  initialName,
  isPending,
  onSubmit,
  onCancel,
}: EditingRowProps) {
  const [draftName, setDraftName] = useState(initialName);
  const trimmed = draftName.trim();
  const isDirty = trimmed.length > 0 && trimmed !== initialName;

  return (
    <Group gap="xs" px="sm" py={6} wrap="nowrap">
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
        size="xs"
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
            variant="subtle"
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

type ConfirmingDeleteRowProps = {
  childName: ChildCategory["name"];
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmingDeleteRow({
  childName,
  isPending,
  onConfirm,
  onCancel,
}: ConfirmingDeleteRowProps) {
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
        「{childName}」を削除しますか？
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
