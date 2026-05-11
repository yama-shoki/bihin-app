"use client";

import { Box, Card, Group, Stack, Text } from "@mantine/core";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { PurchaseRequestStatusBadge } from "@/app/components/common/purchase-request-status-badge";
import { PURCHASE_REQUEST_PAGE_SIZE } from "@/app/constants/pagination";
import { formatDate, formatYen } from "@/app/lib/format";
import type { PurchaseRequestListItem } from "@/app/server/data/purchase-requests";

type Props = {
  requests: PurchaseRequestListItem[];
  sortStatus: DataTableSortStatus<PurchaseRequestListItem>;
  onSortStatusChange: (
    status: DataTableSortStatus<PurchaseRequestListItem>,
  ) => void;
  page: number;
  onPageChange: (page: number) => void;
};

export function EmployeePurchaseRequestTable({
  requests,
  sortStatus,
  onSortStatusChange,
  page,
  onPageChange,
}: Props) {
  const router = useRouter();
  const navigateToDetail = (purchaseRequestId: PurchaseRequestListItem["id"]) =>
    router.push(`/requests/${purchaseRequestId}` as Route);

  // mantine-datatable は records を自動 slice しないので、ここで page-aware に切り出す。
  const paginatedRequests = requests.slice(
    (page - 1) * PURCHASE_REQUEST_PAGE_SIZE,
    page * PURCHASE_REQUEST_PAGE_SIZE,
  );
  const isMultiPage = requests.length > PURCHASE_REQUEST_PAGE_SIZE;

  return (
    <>
      <Box visibleFrom="sm">
        <DataTable
          highlightOnHover
          columns={[
            {
              accessor: "createdAt",
              title: "申請日",
              sortable: true,
              render: (record) => formatDate(record.createdAt),
            },
            { accessor: "title", title: "タイトル", sortable: true },
            {
              accessor: "category",
              title: "カテゴリ",
              render: (record) =>
                `${record.parentCategory.name} / ${record.childCategory.name}`,
            },
            {
              accessor: "amountYen",
              title: "金額",
              sortable: true,
              textAlign: "right",
              titleStyle: { textAlign: "right" },
              render: (record) => formatYen(record.amountYen),
            },
            {
              accessor: "status",
              title: "ステータス",
              render: (record) => (
                <PurchaseRequestStatusBadge status={record.status} />
              ),
            },
          ]}
          height="calc(100dvh - 240px)"
          idAccessor="id"
          minHeight={300}
          noRecordsText="該当する申請はありません"
          onPageChange={onPageChange}
          onRowClick={({ record }) => navigateToDetail(record.id)}
          onSortStatusChange={onSortStatusChange}
          page={page}
          paginationText={({ from, to, totalRecords }) =>
            `${from}〜${to} / ${totalRecords}件`
          }
          records={paginatedRequests}
          recordsPerPage={PURCHASE_REQUEST_PAGE_SIZE}
          rowStyle={(_record, index) => ({
            cursor: "pointer",
            backgroundColor:
              index % 2 === 1 ? "var(--mantine-color-gray-1)" : undefined,
          })}
          sortStatus={sortStatus}
          styles={{
            root: {
              borderRadius: "var(--mantine-radius-md)",
              overflow: "hidden",
            },
            table: {
              "& tbody tr": {
                transition: "background-color 200ms ease",
              },
              "& tbody tr:hover": {
                backgroundColor: "var(--mantine-color-indigo-0)",
              },
            },
            pagination: isMultiPage ? undefined : { display: "none" },
          }}
          totalRecords={requests.length}
          withTableBorder
        />
      </Box>
      <Stack gap="sm" hiddenFrom="sm">
        {paginatedRequests.length === 0 ? (
          <Text c="dimmed" py="xl" ta="center">
            該当する申請はありません
          </Text>
        ) : (
          paginatedRequests.map((request) => (
            <Card
              component="button"
              key={request.id}
              onClick={() => navigateToDetail(request.id)}
              padding="md"
              style={{ cursor: "pointer", textAlign: "left" }}
              type="button"
              w="100%"
              withBorder
            >
              <Stack gap="xs">
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={600}>{request.title}</Text>
                  <PurchaseRequestStatusBadge status={request.status} />
                </Group>
                <Text c="dimmed" size="sm">
                  {request.parentCategory.name} / {request.childCategory.name}
                </Text>
                <Group justify="space-between">
                  <Text fw={500} size="sm">
                    {formatYen(request.amountYen)}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {formatDate(request.createdAt)}
                  </Text>
                </Group>
              </Stack>
            </Card>
          ))
        )}
      </Stack>
    </>
  );
}
