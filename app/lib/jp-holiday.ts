import * as holidayJp from "@holiday-jp/holiday_jp";

export function isJapaneseHoliday(date: Date): boolean {
  return holidayJp.isHoliday(date);
}

export function getJapaneseHolidayName(date: Date): string | undefined {
  const holidays = holidayJp.between(date, date);
  return holidays[0]?.name;
}
