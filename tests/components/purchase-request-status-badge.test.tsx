import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PurchaseRequestStatusBadge } from "@/app/components/common/purchase-request-status-badge";
import type { PurchaseRequestStatus } from "@/db/schema/purchase-requests";

function renderWithMantine(ui: React.ReactNode) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe("PurchaseRequestStatusBadge", () => {
  const cases: [PurchaseRequestStatus, string][] = [
    ["pending", "申請中"],
    ["approved", "承認済み"],
    ["rejected", "却下"],
  ];

  it.each(cases)("%s の表示文言を描画する", (status, label) => {
    renderWithMantine(<PurchaseRequestStatusBadge status={status} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
