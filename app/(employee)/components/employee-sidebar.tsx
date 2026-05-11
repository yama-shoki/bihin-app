"use client";

import { Button, Divider, NavLink, Stack } from "@mantine/core";
import {
  type Icon,
  IconFilePlus,
  IconListCheck,
  IconLogout,
} from "@tabler/icons-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMobileNavbar } from "@/app/components/layout/app-shell-layout";
import { logout } from "@/app/server/actions/auth";

const NAV_ITEMS: { href: string; label: string; icon: Icon }[] = [
  { href: "/requests", label: "申請一覧", icon: IconListCheck },
  { href: "/requests/new", label: "新規申請", icon: IconFilePlus },
] as const;

export function EmployeeSidebar() {
  const pathname = usePathname();
  const mobileNavbar = useMobileNavbar();
  const handleNavigate = mobileNavbar?.closeMobile;

  return (
    <Stack gap="xs" h="100%" justify="space-between">
      <Stack gap={0}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              active={pathname === item.href}
              component={Link}
              href={item.href as Route}
              key={item.href}
              label={item.label}
              leftSection={<Icon size={16} />}
              onClick={handleNavigate}
            />
          );
        })}
      </Stack>
      <Stack gap="xs">
        <Divider />
        <Button
          color="red"
          leftSection={<IconLogout size={16} />}
          onClick={() => logout()}
          variant="light"
        >
          ログアウト
        </Button>
      </Stack>
    </Stack>
  );
}
