"use client";

import { Button, Group, Menu, Stack, Text } from "@mantine/core";
import { ROLE_LABELS } from "@/app/constants/role";
import { loginAs, logout } from "@/app/server/actions/auth";
import type { User } from "@/db/types";

interface Props {
  currentUser: Pick<User, "id" | "name" | "department" | "role">;
  candidates: Pick<User, "id" | "name" | "department" | "role">[];
}

export function UserSwitcher({ currentUser, candidates }: Props) {
  return (
    <Menu position="bottom-end" shadow="md" width={240}>
      <Menu.Target>
        <Button variant="subtle">
          {currentUser.name} ({ROLE_LABELS[currentUser.role]})
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {candidates.map((user) => (
          <Menu.Item key={user.id} onClick={() => loginAs(user.id)}>
            <Stack gap={2}>
              <Group gap="xs">
                <Text fw={500} size="sm">
                  {user.name}
                </Text>
                <Text c="dimmed" size="xs">
                  {ROLE_LABELS[user.role]}
                </Text>
              </Group>
              <Text c="dimmed" size="xs">
                {user.department}
              </Text>
            </Stack>
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Menu.Item color="red" onClick={() => logout()}>
          ログアウト
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
