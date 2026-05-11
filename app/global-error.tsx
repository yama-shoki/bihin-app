"use client";

import {
  Button,
  Container,
  MantineProvider,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { theme } from "./theme";

type Props = {
  reset?: () => void;
  unstable_retry?: () => void;
};

export default function GlobalError({ reset, unstable_retry }: Props) {
  const retry = unstable_retry ?? reset;

  return (
    <html lang="ja">
      <body>
        <MantineProvider forceColorScheme="light" theme={theme}>
          <Container py={80} size="sm">
            <Stack align="center" gap="md">
              <IconAlertTriangle color="var(--mantine-color-red-6)" size={64} />
              <Title order={1} ta="center">
                エラーが発生しました
              </Title>
              <Text c="dimmed" ta="center">
                レイアウトの読み込みに失敗しました。再試行しても解消しない場合は、トップページからログインし直してください。
              </Text>
              <Button disabled={!retry} onClick={retry}>
                再試行
              </Button>
            </Stack>
          </Container>
        </MantineProvider>
      </body>
    </html>
  );
}
