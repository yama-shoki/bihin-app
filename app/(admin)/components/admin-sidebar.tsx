"use client";

import { Button, Divider, Group, NavLink, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCategory,
  IconHourglassHigh,
  IconListCheck,
  IconLogout,
} from "@tabler/icons-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useMobileNavbar } from "@/app/components/layout/app-shell-layout";
import { logout } from "@/app/server/actions/auth";
import type { CategoryGroup } from "@/app/server/data/categories";
import { CategoryManagementModal } from "./category-management-modal";

type Props = {
  pendingBadge: ReactNode;
  categories: CategoryGroup[];
};

export function AdminSidebar({ pendingBadge, categories }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mobileNavbar = useMobileNavbar();
  const handleNavigate = mobileNavbar?.closeMobile;
  const isRequestsPage = pathname === "/admin/requests";
  const isPendingFilter = searchParams.get("status") === "pending";
  const [
    categoryModalOpened,
    { open: openCategoryModal, close: closeCategoryModal },
  ] = useDisclosure(false);

  const handleOpenCategoryModal = () => {
    handleNavigate?.();
    openCategoryModal();
  };

  return (
    <>
      <Stack gap="xs" h="100%" justify="space-between">
        <Stack gap={0}>
          <NavLink
            active={isRequestsPage && !isPendingFilter}
            component={Link}
            href={"/admin/requests" as Route}
            label="全申請"
            leftSection={<IconListCheck size={16} />}
            onClick={handleNavigate}
          />
          <NavLink
            active={isRequestsPage && isPendingFilter}
            component={Link}
            href={"/admin/requests?status=pending" as Route}
            label={
              <Group gap="xs" justify="space-between" wrap="nowrap" w="100%">
                <Text component="span">承認待ち</Text>
                {pendingBadge}
              </Group>
            }
            leftSection={<IconHourglassHigh size={16} />}
            onClick={handleNavigate}
          />
          <NavLink
            label="カテゴリ管理"
            leftSection={<IconCategory size={16} />}
            onClick={handleOpenCategoryModal}
          />
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
      <CategoryManagementModal
        categories={categories}
        onClose={closeCategoryModal}
        opened={categoryModalOpened}
      />
    </>
  );
}
