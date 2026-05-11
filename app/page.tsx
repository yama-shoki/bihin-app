import {
  Badge,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { ROLE_BADGE_COLORS, ROLE_LABELS } from "@/app/constants/role";
import { loginAs } from "@/app/server/actions/auth";
import { listSeedUsers } from "@/app/server/data/users";

export default async function LoginPage() {
  const users = await listSeedUsers();

  return (
    <Container py="xl" size="md">
      <Stack align="center" gap="xl">
        <Title order={1}>備品購入申請アプリ</Title>
        <Text c="dimmed">ログインするユーザーを選んでください</Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} w="100%">
          {users.map((user) => (
            <form action={loginAs.bind(null, user.id)} key={user.id}>
              <Card
                component="button"
                padding="md"
                style={{ cursor: "pointer", textAlign: "left" }}
                type="submit"
                w="100%"
                withBorder
              >
                <Stack gap={4}>
                  <Group align="center" gap="sm" wrap="nowrap">
                    <Text fw={600} size="lg">
                      {user.name}
                    </Text>
                    <Badge
                      color={ROLE_BADGE_COLORS[user.role]}
                      size="md"
                      variant="light"
                    >
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </Group>
                  <Text c="dimmed" size="sm">
                    {user.department}
                  </Text>
                </Stack>
              </Card>
            </form>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
