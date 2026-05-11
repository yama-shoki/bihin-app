import type { ReactNode } from "react";
import { AppHeader } from "@/app/components/layout/app-header";
import { AppShellLayout } from "@/app/components/layout/app-shell-layout";
import { requireRole } from "@/app/lib/auth";
import { EmployeeSidebar } from "./components/employee-sidebar";

export default async function EmployeeLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  await requireRole("employee");

  return (
    <AppShellLayout header={<AppHeader />} sidebar={<EmployeeSidebar />}>
      {children}
    </AppShellLayout>
  );
}
