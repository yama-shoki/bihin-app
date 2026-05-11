"use client";

import { Anchor, Breadcrumbs, Text } from "@mantine/core";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Crumb = { label: string; href: Route };

function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "admin" && segments[1] === "requests") {
    const items: Crumb[] = [
      { label: "全申請", href: "/admin/requests" as Route },
    ];
    if (segments[2]) {
      items.push({ label: "申請詳細", href: pathname as Route });
    }
    return items;
  }

  if (segments[0] === "requests") {
    const items: Crumb[] = [{ label: "申請一覧", href: "/requests" as Route }];
    if (segments[1] === "new") {
      items.push({ label: "新規申請", href: "/requests/new" as Route });
    } else if (segments[1]) {
      items.push({ label: "申請詳細", href: pathname as Route });
    }
    return items;
  }

  return [];
}

export function AppBreadcrumbs() {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);

  if (crumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumbs separator="/" separatorMargin="xs">
      {crumbs.map((crumb, index) =>
        index === crumbs.length - 1 ? (
          <Text c="dimmed" key={crumb.href} size="sm">
            {crumb.label}
          </Text>
        ) : (
          <Anchor component={Link} href={crumb.href} key={crumb.href} size="sm">
            {crumb.label}
          </Anchor>
        ),
      )}
    </Breadcrumbs>
  );
}
