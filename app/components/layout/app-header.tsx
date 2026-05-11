import { Box, Group, Title } from "@mantine/core";
import { getSession } from "@/app/lib/auth";
import { listSeedUsers } from "@/app/server/data/users";
import type { User } from "@/db/types";
import { AppBreadcrumbs } from "./app-breadcrumbs";
import { UserSwitcher } from "./user-switcher";

type UserSwitcherUser = Pick<User, "id" | "name" | "department" | "role">;

export async function AppHeader() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const currentUser: UserSwitcherUser = {
    id: session.user.id,
    name: session.user.name,
    department: session.user.department,
    role: session.user.role,
  };
  const candidates = (await listSeedUsers()).map(
    (user): UserSwitcherUser => ({
      id: user.id,
      name: user.name,
      department: user.department,
      role: user.role,
    }),
  );

  return (
    <Group h="100%" justify="space-between" style={{ flex: 1 }} wrap="nowrap">
      <Group gap="xl" wrap="nowrap">
        <Title order={3}>備品購入申請</Title>
        <Box visibleFrom="sm">
          <AppBreadcrumbs />
        </Box>
      </Group>
      <UserSwitcher candidates={candidates} currentUser={currentUser} />
    </Group>
  );
}
