import { Button, Container, Stack, Title } from "@mantine/core";

export default function LoginPage() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="md" align="center">
        <Title order={1}>備品購入申請アプリ</Title>
        <Button>ボタン (動作確認用)</Button>
      </Stack>
    </Container>
  );
}
