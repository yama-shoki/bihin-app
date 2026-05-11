import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "mantine-datatable/styles.layer.css";
import "dayjs/locale/ja";
import { MantineProvider, mantineHtmlProps } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { theme } from "./theme";

export const metadata: Metadata = {
  title: "備品購入申請アプリ",
  description: "社内向けの備品購入申請プロトタイプ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ja" {...mantineHtmlProps}>
      <body>
        <NuqsAdapter>
          <MantineProvider forceColorScheme="light" theme={theme}>
            <DatesProvider
              settings={{
                locale: "ja",
                firstDayOfWeek: 0,
                weekendDays: [0, 6],
                consistentWeeks: true,
              }}
            >
              <ModalsProvider>
                <Notifications />
                {children}
              </ModalsProvider>
            </DatesProvider>
          </MantineProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
