import { Button, Container, Stack, Text, Title } from "@mantine/core";
import { IconHome, IconQuestionMark } from "@tabler/icons-react";
import type { Route } from "next";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <Container py="xl" size="sm">
      <Stack align="center" gap="md">
        <IconQuestionMark color="var(--mantine-color-gray-6)" size={64} />
        <Title order={2}>ページが見つかりません</Title>
        <Text c="dimmed" ta="center">
          指定された URL は存在しないか、削除された可能性があります。
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
