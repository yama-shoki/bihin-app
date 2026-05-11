import { PurchaseRequestDetail } from "@/app/components/common/purchase-request-detail";
import type {
  ApprovalHistoryItem,
  PurchaseRequestListItem,
} from "@/app/server/data/purchase-requests";
import { AdminPurchaseRequestActions } from "./admin-purchase-request-actions";

type Props = {
  request: PurchaseRequestListItem;
  histories: ApprovalHistoryItem[];
};

export function AdminPurchaseRequestDetail({ request, histories }: Props) {
  return (
    <PurchaseRequestDetail
      actions={
        request.status === "pending" ? (
          <AdminPurchaseRequestActions
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
