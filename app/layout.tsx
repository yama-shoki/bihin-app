import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "mantine-datatable/styles.layer.css";
import { MantineProvider, mantineHtmlProps } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

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
          <MantineProvider forceColorScheme="light">
            <ModalsProvider>
              <Notifications />
              {children}
            </ModalsProvider>
          </MantineProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
