import type { UserRole } from "@/db/schema/users";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "管理者",
  employee: "一般社員",
};
