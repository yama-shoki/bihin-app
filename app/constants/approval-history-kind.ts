import type { MantineColor } from "@mantine/core";
import {
  type Icon,
  IconArrowBackUp,
  IconCircleCheck,
  IconCircleX,
  IconFilePlus,
} from "@tabler/icons-react";
import type { ApprovalHistoryKind } from "@/db/types";

export const APPROVAL_HISTORY_KIND_LABELS: Record<ApprovalHistoryKind, string> =
  {
    created: "申請",
    approved: "承認",
    rejected: "却下",
    withdrawn: "取り下げ",
  };

export const APPROVAL_HISTORY_KIND_COLORS: Record<
  ApprovalHistoryKind,
  MantineColor
> = {
  created: "gray",
  approved: "blue",
  rejected: "red",
  withdrawn: "gray",
};

export const APPROVAL_HISTORY_KIND_ICONS: Record<ApprovalHistoryKind, Icon> = {
  created: IconFilePlus,
  approved: IconCircleCheck,
  rejected: IconCircleX,
  withdrawn: IconArrowBackUp,
};
