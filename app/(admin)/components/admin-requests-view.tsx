"use client";

import { Group, Stack } from "@mantine/core";
import type { DataTableSortStatus } from "mantine-datatable";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { PurchaseRequestCategoryFilter } from "@/app/components/common/purchase-request-category-filter";
import { PurchaseRequestSearchInput } from "@/app/components/common/purchase-request-search-input";
import { PurchaseRequestStatusFilter } from "@/app/components/common/purchase-request-status-filter";
import {
  PURCHASE_REQUEST_STATUS_FILTER_VALUES,
  type PurchaseRequestStatusFilterValue,
} from "@/app/constants/purchase-request-status";
import { normalizeJapaneseSearchTerm } from "@/app/lib/text";
import type { CategoryGroup } from "@/app/server/data/categories";
import type { PurchaseRequestListItem } from "@/app/server/data/purchase-requests";
import { AdminPurchaseRequestTable } from "./admin-purchase-request-table";

const ADMIN_SORT_COLUMNS = [
  "createdAt",
  "title",
  "amountYen",
  "applicantName",
] as const;
const SORT_DIRECTIONS = ["asc", "desc"] as const;

type AdminSortColumn = (typeof ADMIN_SORT_COLUMNS)[number];

type Props = {
  requests: PurchaseRequestListItem[];
  categories: CategoryGroup[];
};

export function AdminRequestsView({ requests, categories }: Props) {
  const [
    { status, parentCategoryId, q, sortColumn, sortDirection, page },
    setQueryParams,
  ] = useQueryStates(
    {
      status: parseAsStringLiteral(
        PURCHASE_REQUEST_STATUS_FILTER_VALUES,
      ).withDefault("all"),
      parentCategoryId: parseAsString,
      q: parseAsString.withDefault(""),
      sortColumn:
        parseAsStringLiteral(ADMIN_SORT_COLUMNS).withDefault("createdAt"),
      sortDirection: parseAsStringLiteral(SORT_DIRECTIONS).withDefault("desc"),
      page: parseAsInteger.withDefault(1),
    },
    { throttleMs: 300 },
  );

  const normalizedQuery = normalizeJapaneseSearchTerm(q.trim());
  const searchFilteredRequests = normalizedQuery
    ? requests.filter((request) => {
        const titleMatch = normalizeJapaneseSearchTerm(request.title).includes(
          normalizedQuery,
        );
        const applicantMatch = normalizeJapaneseSearchTerm(
          request.applicant.name,
        ).includes(normalizedQuery);
        return titleMatch || applicantMatch;
      })
    : requests;

  const categoryFilteredRequests = parentCategoryId
    ? searchFilteredRequests.filter(
        (request) => request.parentCategory.id === parentCategoryId,
      )
    : searchFilteredRequests;

  const statusCounts = PURCHASE_REQUEST_STATUS_FILTER_VALUES.reduce(
    (acc, filterValue) => {
      acc[filterValue] =
        filterValue === "all"
          ? categoryFilteredRequests.length
          : categoryFilteredRequests.filter(
              (request) => request.status === filterValue,
            ).length;
      return acc;
    },
    {} as Record<PurchaseRequestStatusFilterValue, number>,
  );

  const statusFilteredRequests =
    status === "all"
      ? categoryFilteredRequests
      : categoryFilteredRequests.filter((request) => request.status === status);

  const sortDirectionMultiplier = sortDirection === "asc" ? 1 : -1;
  const sortedRequests = statusFilteredRequests.toSorted((left, right) => {
    if (sortColumn === "createdAt") {
      return (
        sortDirectionMultiplier *
        (left.createdAt.getTime() - right.createdAt.getTime())
      );
    }
    if (sortColumn === "amountYen") {
      return sortDirectionMultiplier * (left.amountYen - right.amountYen);
    }
    if (sortColumn === "applicantName") {
      return (
        sortDirectionMultiplier *
        left.applicant.name.localeCompare(right.applicant.name, "ja")
      );
    }
    return (
      sortDirectionMultiplier * left.title.localeCompare(right.title, "ja")
    );
  });

  const sortStatus: DataTableSortStatus<PurchaseRequestListItem> = {
    columnAccessor: sortColumn,
    direction: sortDirection,
  };

  return (
    <Stack gap="md">
      <Group align="flex-end" gap="md" justify="space-between" wrap="wrap">
        <PurchaseRequestStatusFilter
          counts={statusCounts}
          onChange={(nextStatus) =>
            setQueryParams({ status: nextStatus, page: 1 })
          }
          value={status}
        />
        <Group gap="sm" wrap="wrap">
          <PurchaseRequestSearchInput
            onChange={(nextQuery) => setQueryParams({ q: nextQuery, page: 1 })}
            value={q}
          />
          <PurchaseRequestCategoryFilter
            categories={categories}
            onChange={(nextParentCategoryId) =>
              setQueryParams({
                parentCategoryId: nextParentCategoryId,
                page: 1,
              })
            }
            value={parentCategoryId}
          />
        </Group>
      </Group>
      <AdminPurchaseRequestTable
        onPageChange={(nextPage) => setQueryParams({ page: nextPage })}
        onSortStatusChange={(nextSortStatus) =>
          setQueryParams({
            sortColumn: nextSortStatus.columnAccessor as AdminSortColumn,
            sortDirection: nextSortStatus.direction,
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
