"use client";

import { AppShell, Burger, Group } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import type { ReactNode } from "react";
import { EmployeeSidebar } from "./employee-sidebar";

type Props = {
  header: ReactNode;
  children: ReactNode;
};

export function EmployeeShell({ header, children }: Props) {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure();
  const isMobile = useMediaQuery("(max-width: 48em)") ?? false;

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened },
      }}
      padding="md"
      styles={{
        navbar: isMobile ? { maxWidth: "80vw" } : undefined,
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" gap="sm" wrap="nowrap" align="center">
          <Burger
            hiddenFrom="sm"
            onClick={toggleMobile}
            opened={mobileOpened}
            size="sm"
          />
          {header}
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <EmployeeSidebar onNavigate={closeMobile} />
      </AppShell.Navbar>
      <AppShell.Main
        onClick={() => {
          if (mobileOpened) {
            closeMobile();
          }
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
