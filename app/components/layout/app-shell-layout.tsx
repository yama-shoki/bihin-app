"use client";

import { AppShell, Burger, Group } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { createContext, type ReactNode, useContext } from "react";

type MobileNavbarValue = {
  /** Sidebar の Link クリック時にモバイル drawer を閉じるためのコールバック。 */
  closeMobile: () => void;
};

const MobileNavbarContext = createContext<MobileNavbarValue | null>(null);

/**
 * Sidebar 側で「ナビゲーション後にモバイル drawer を閉じる」用の hook。
 * Server Component → Client Component への関数 props 渡しを避けるため Context 経由にしている。
 */
export function useMobileNavbar(): MobileNavbarValue | null {
  return useContext(MobileNavbarContext);
}

type Props = {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
};

export function AppShellLayout({ header, sidebar, children }: Props) {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure();
  const isMobile = useMediaQuery("(max-width: 48em)") ?? false;

  return (
    <MobileNavbarContext.Provider value={{ closeMobile }}>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 240,
          breakpoint: "sm",
          collapsed: { mobile: !mobileOpened },
        }}
        padding="md"
        styles={{
          navbar: { maxWidth: isMobile ? "80vw" : undefined },
        }}
      >
        <AppShell.Header>
          <Group align="center" gap="sm" h="100%" px="md" wrap="nowrap">
            <Burger
              hiddenFrom="sm"
              onClick={toggleMobile}
              opened={mobileOpened}
              size="sm"
            />
            {header}
          </Group>
        </AppShell.Header>
        <AppShell.Navbar p="md">{sidebar}</AppShell.Navbar>
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
    </MobileNavbarContext.Provider>
  );
}
