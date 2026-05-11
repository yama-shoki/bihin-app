import { Button, Container, Stack, Text, Title } from "@mantine/core";
import { IconHome, IconLock } from "@tabler/icons-react";
import type { Route } from "next";
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <Container py="xl" size="sm">
      <Stack align="center" gap="md">
        <IconLock color="var(--mantine-color-red-6)" size={64} />
        <Title order={2}>アクセスが許可されていません</Title>
        <Text c="dimmed" ta="center">
          このページにアクセスする権限がありません。トップに戻ってログインユーザーを確認してください。
        </Text>
        <Link href={"/" as Route} style={{ textDecoration: "none" }}>
          <Button
            component="span"
            leftSection={<IconHome size={16} />}
            variant="default"
          >
            トップに戻る
          </Button>
        </Link>
      </Stack>
    </Container>
  );
}
