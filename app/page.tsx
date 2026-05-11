import {
  Badge,
  Card,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { ROLE_LABELS } from "@/app/constants/role";
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
                <Stack gap="xs">
                  <Text fw={600} size="lg">
                    {user.name}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {user.department}
                  </Text>
                  <Badge color={user.role === "admin" ? "blue" : "gray"}>
                    {ROLE_LABELS[user.role]}
                  </Badge>
                </Stack>
              </Card>
            </form>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
