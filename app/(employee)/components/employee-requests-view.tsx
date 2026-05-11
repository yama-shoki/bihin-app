"use client";

import { Group, Stack } from "@mantine/core";
import type { DataTableSortStatus } from "mantine-datatable";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import type { CategoryGroup } from "@/app/server/data/categories";
import type { PurchaseRequestListItem } from "@/app/server/data/purchase-requests";
import { PURCHASE_REQUEST_STATUSES } from "@/db/constants/purchase-request-status";
import { EmployeePurchaseRequestTable } from "./employee-purchase-request-table";
import { PurchaseRequestCategoryFilter } from "./purchase-request-category-filter";
import { PurchaseRequestSearchInput } from "./purchase-request-search-input";
import {
  PurchaseRequestStatusFilter,
  type StatusFilterValue,
} from "./purchase-request-status-filter";

const STATUS_VALUES = ["all", ...PURCHASE_REQUEST_STATUSES] as const;
const SORT_COLUMNS = ["createdAt", "title", "amountYen"] as const;
const SORT_DIRECTIONS = ["asc", "desc"] as const;

// カタカナ → ひらがな 正規化 (検索でひらがな/カタカナどちらでもヒットさせる)
function normalizeJa(value: string): string {
  return value
    .replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60))
    .toLowerCase();
}

type Props = {
  requests: PurchaseRequestListItem[];
  categories: CategoryGroup[];
};

export function EmployeeRequestsView({ requests, categories }: Props) {
  const [
    { status, parentCategoryId, q, sortColumn, sortDirection, page },
    setParams,
  ] = useQueryStates(
    {
      status: parseAsStringLiteral(STATUS_VALUES).withDefault("all"),
      parentCategoryId: parseAsString,
      q: parseAsString.withDefault(""),
      sortColumn: parseAsStringLiteral(SORT_COLUMNS).withDefault("createdAt"),
      sortDirection: parseAsStringLiteral(SORT_DIRECTIONS).withDefault("desc"),
      page: parseAsInteger.withDefault(1),
    },
    { throttleMs: 300 },
  );

  const normalizedQuery = normalizeJa(q.trim());
  const searchFiltered = normalizedQuery
    ? requests.filter((request) =>
        normalizeJa(request.title).includes(normalizedQuery),
      )
    : requests;

  const categoryFiltered = parentCategoryId
    ? searchFiltered.filter(
        (request) => request.parentCategory.id === parentCategoryId,
      )
    : searchFiltered;

  const counts = {
    pending: categoryFiltered.filter((request) => request.status === "pending")
      .length,
    approved: categoryFiltered.filter(
      (request) => request.status === "approved",
    ).length,
    rejected: categoryFiltered.filter(
      (request) => request.status === "rejected",
    ).length,
    all: categoryFiltered.length,
  } satisfies Record<StatusFilterValue, number>;

  const statusFiltered =
    status === "all"
      ? categoryFiltered
      : categoryFiltered.filter((request) => request.status === status);

  const sortedRequests = statusFiltered.toSorted((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1;
    if (sortColumn === "createdAt") {
      return direction * (a.createdAt.getTime() - b.createdAt.getTime());
    }
    if (sortColumn === "amountYen") {
      return direction * (a.amountYen - b.amountYen);
    }
    return direction * a.title.localeCompare(b.title, "ja");
  });

  const sortStatus: DataTableSortStatus<PurchaseRequestListItem> = {
    columnAccessor: sortColumn,
    direction: sortDirection,
  };

  return (
    <Stack gap="md">
      <Group align="flex-end" gap="md" justify="space-between" wrap="wrap">
        <PurchaseRequestStatusFilter
          counts={counts}
          onChange={(next) => setParams({ status: next, page: 1 })}
          value={status}
        />
        <Group gap="sm" wrap="wrap">
          <PurchaseRequestSearchInput
            onChange={(next) => setParams({ q: next, page: 1 })}
            value={q}
          />
          <PurchaseRequestCategoryFilter
            categories={categories}
            onChange={(next) => setParams({ parentCategoryId: next, page: 1 })}
            value={parentCategoryId}
          />
        </Group>
      </Group>
      <EmployeePurchaseRequestTable
        onPageChange={(p) => setParams({ page: p })}
        onSortStatusChange={(s) =>
          setParams({
            sortColumn: s.columnAccessor as (typeof SORT_COLUMNS)[number],
            sortDirection: s.direction,
            page: 1,
          })
        }
        page={page}
        requests={sortedRequests}
        sortStatus={sortStatus}
      />
    </Stack>
  );
}
