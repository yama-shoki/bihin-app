"use client";

import { NavLink } from "@mantine/core";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/requests", label: "申請一覧" },
  { href: "/requests/new", label: "新規申請" },
] as const;

type Props = {
  onNavigate?: () => void;
};

export function EmployeeSidebar({ onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <>
      {NAV_ITEMS.map((item) => (
        <NavLink
          active={pathname === item.href}
          component={Link}
          href={item.href as Route}
          key={item.href}
          label={item.label}
          onClick={onNavigate}
        />
      ))}
    </>
  );
}
