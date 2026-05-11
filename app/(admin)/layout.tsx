import type { ReactNode } from "react";
import { AppHeader } from "@/app/components/layout/app-header";
import { AppShellLayout } from "@/app/components/layout/app-shell-layout";
import { requireRole } from "@/app/lib/auth";
import { listCategories } from "@/app/server/data/categories";
import { AdminSidebar } from "./components/admin-sidebar";
import { PendingPurchaseRequestCountBadge } from "./components/pending-purchase-request-count-badge";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  await requireRole("admin");
  const categories = await listCategories();

  return (
    <AppShellLayout
      header={<AppHeader />}
      sidebar={
        <AdminSidebar
          categories={categories}
          pendingBadge={<PendingPurchaseRequestCountBadge />}
        />
      }
    >
      {children}
    </AppShellLayout>
  );
}
