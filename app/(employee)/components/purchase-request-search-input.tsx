"use client";

import { CloseButton, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function PurchaseRequestSearchInput({ value, onChange }: Props) {
  const [local, setLocal] = useState(value);
  const debouncedOnChange = useDebouncedCallback(onChange, 300);

  // URL → local の同期 (戻るボタン / 直接 URL アクセスで外部から value が変わったとき)
  useEffect(() => {
    setLocal(value);
  }, [value]);

  return (
    <TextInput
      leftSection={<IconSearch size={16} />}
      onChange={(event) => {
        setLocal(event.currentTarget.value);
        debouncedOnChange(event.currentTarget.value);
      }}
      placeholder="タイトルで検索"
      rightSection={
        local ? (
          <CloseButton
            aria-label="検索クリア"
            onClick={() => {
              setLocal("");
              debouncedOnChange("");
            }}
            size="sm"
          />
        ) : null
      }
      value={local}
      w={{ base: "100%", sm: 240 }}
    />
  );
}
