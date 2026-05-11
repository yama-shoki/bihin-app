import dayjs from "dayjs";
import "dayjs/locale/ja";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale("ja");
dayjs.tz.setDefault("Asia/Tokyo");

const NULL_TEXT = "—";

export function formatDate(date: Date | null | undefined): string {
  return date ? dayjs(date).tz().format("YYYY/MM/DD") : NULL_TEXT;
}

export function formatDateTime(date: Date | null | undefined): string {
  return date ? dayjs(date).tz().format("YYYY/MM/DD HH:mm") : NULL_TEXT;
}

export function formatRelativeDate(date: Date | null | undefined): string {
  return date ? dayjs(date).fromNow() : NULL_TEXT;
}

const YEN_FORMATTER = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

export function formatYen(amount: number): string {
  return YEN_FORMATTER.format(amount);
}
