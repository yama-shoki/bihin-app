import { PurchaseRequestDetail } from "@/app/components/common/purchase-request-detail";
import type {
  ApprovalHistoryItem,
  PurchaseRequestListItem,
} from "@/app/server/data/purchase-requests";
import { EmployeePurchaseRequestActions } from "./employee-purchase-request-actions";

type Props = {
  request: PurchaseRequestListItem;
  histories: ApprovalHistoryItem[];
};

export function EmployeePurchaseRequestDetail({ request, histories }: Props) {
  return (
    <PurchaseRequestDetail
      actions={
        request.status === "pending" ? (
          <EmployeePurchaseRequestActions
            amountYen={request.amountYen}
            purchaseRequestId={request.id}
            title={request.title}
          />
        ) : null
      }
      histories={histories}
      request={request}
    />
  );
}
