import type { ReactNode } from "react";
import { AppHeader } from "@/app/components/layout/app-header";
import { requireRole } from "@/app/lib/auth";
import { EmployeeShell } from "./components/employee-shell";

export default async function EmployeeLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  await requireRole("employee");

  return <EmployeeShell header={<AppHeader />}>{children}</EmployeeShell>;
}
