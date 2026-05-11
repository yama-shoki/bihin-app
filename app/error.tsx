"use client";

import { Button, Container, Group, Stack, Text, Title } from "@mantine/core";
import { IconAlertTriangle, IconHome } from "@tabler/icons-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset?: () => void;
  unstable_retry?: () => void;
};

export default function ErrorPage({ error, reset, unstable_retry }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const retry = unstable_retry ?? reset;

  return (
    <Container py="xl" size="sm">
      <Stack align="center" gap="md">
        <IconAlertTriangle color="var(--mantine-color-red-6)" size={64} />
        <Title order={2}>エラーが発生しました</Title>
        <Text c="dimmed" ta="center">
          一時的な問題の可能性があります。再試行するか、トップに戻ってください。
        </Text>
        <Group gap="sm">
          <Button disabled={!retry} onClick={retry}>
            再試行
          </Button>
          <Link href={"/" as Route} style={{ textDecoration: "none" }}>
            <Button
              component="span"
              leftSection={<IconHome size={16} />}
              variant="default"
            >
              トップに戻る
            </Button>
          </Link>
        </Group>
      </Stack>
    </Container>
  );
}
