"use client";

import { Box, Card, Group, Stack, Text } from "@mantine/core";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { PurchaseRequestStatusBadge } from "@/app/components/common/purchase-request-status-badge";
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

const PAGE_SIZE = 10;

export function EmployeePurchaseRequestTable({
  requests,
  sortStatus,
  onSortStatusChange,
  page,
  onPageChange,
}: Props) {
  const router = useRouter();
  const goTo = (id: PurchaseRequestListItem["id"]) =>
    router.push(`/requests/${id}` as Route);

  return (
    <>
      <Box visibleFrom="sm">
        <DataTable
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
          onRowClick={({ record }) => goTo(record.id)}
          onSortStatusChange={onSortStatusChange}
          page={page}
          paginationText={({ from, to, totalRecords }) =>
            `${from}〜${to} / ${totalRecords}件`
          }
          records={requests}
          recordsPerPage={PAGE_SIZE}
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
                transition: "background-color 120ms ease",
              },
              "& tbody tr:hover": {
                backgroundColor: "var(--mantine-color-indigo-0)",
              },
            },
          }}
          totalRecords={requests.length}
          withTableBorder
        />
      </Box>
      <Stack gap="sm" hiddenFrom="sm">
        {requests.length === 0 ? (
          <Text c="dimmed" py="xl" ta="center">
            該当する申請はありません
          </Text>
        ) : (
          requests.map((request) => (
            <Card
              component="button"
              key={request.id}
              onClick={() => goTo(request.id)}
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
