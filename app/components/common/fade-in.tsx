import { Box } from "@mantine/core";
import type { ReactNode } from "react";
import classes from "./fade-in.module.css";

type Props = {
  children: ReactNode;
};

export function FadeIn({ children }: Props) {
  return <Box className={classes["fade-in"]}>{children}</Box>;
}
