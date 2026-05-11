import type { MantineColor } from "@mantine/core";
import type { UserRole } from "@/db/types";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "管理者",
  employee: "一般社員",
};

export const ROLE_BADGE_COLORS: Record<UserRole, MantineColor> = {
  admin: "blue",
  employee: "gray",
};
