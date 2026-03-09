/**
 * Working hours utilities for coffee trucks
 */

export const DAYS_OF_WEEK = [
  { value: 0, name: "sunday", nameHe: "ראשון", shortHe: "א'" },
  { value: 1, name: "monday", nameHe: "שני", shortHe: "ב'" },
  { value: 2, name: "tuesday", nameHe: "שלישי", shortHe: "ג'" },
  { value: 3, name: "wednesday", nameHe: "רביעי", shortHe: "ד'" },
  { value: 4, name: "thursday", nameHe: "חמישי", shortHe: "ה'" },
  { value: 5, name: "friday", nameHe: "שישי", shortHe: "ו'" },
  { value: 6, name: "saturday", nameHe: "שבת", shortHe: "שבת" },
] as const;

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DayHours {
  dayOfWeek: DayOfWeek;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}

export type WeeklyHours = DayHours[];

/**
 * Get current time in Israel timezone
 */
export function getIsraelTime(): Date {
  const now = new Date();
  const isoString = now.toISOString();
  const targetTime = new Date(
    new Date(isoString).toLocaleString("en-US", {
      timeZone: "Asia/Jerusalem",
    }),
  );
  return targetTime;
}

/**
 * Format time string for display (e.g., "09:00" -> "9:00")
 */
export function formatTime(time: string): string {
  const [hour, minute] = time.split(":");
  const hourNum = Number.parseInt(hour, 10);
  if (hourNum === 0) return `12:${minute} לילה`;
  if (hourNum < 12) return `${hourNum}:${minute}`;
  if (hourNum === 12) return `12:${minute}`;
  return `${hourNum - 12}:${minute}`;
}

/**
 * Check if truck is open now based on hours
 */
export function isOpenNow(hours: WeeklyHours): boolean {
  const now = getIsraelTime();
  const currentDay = now.getDay() as DayOfWeek;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayHours = hours.find((h) => h.dayOfWeek === currentDay);
  if (
    !todayHours ||
    todayHours.isClosed ||
    !todayHours.openTime ||
    !todayHours.closeTime
  ) {
    return false;
  }

  const [openHour, openMin] = todayHours.openTime.split(":").map(Number);
  const [closeHour, closeMin] = todayHours.closeTime.split(":").map(Number);
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

/**
 * Get today's hours or null if closed
 */
export function getTodayHours(hours: WeeklyHours): DayHours | null {
  const now = getIsraelTime();
  const currentDay = now.getDay() as DayOfWeek;
  return hours.find((h) => h.dayOfWeek === currentDay) ?? null;
}

/**
 * Get a blank WeeklyHours array (all days closed)
 */
export function getBlankWeeklyHours(): WeeklyHours {
  return DAYS_OF_WEEK.map((day) => ({
    dayOfWeek: day.value as DayOfWeek,
    openTime: null,
    closeTime: null,
    isClosed: true,
  }));
}

/**
 * Convert database hours to display format
 * Groups consecutive days with same hours
 */
export function groupHoursForDisplay(hours: WeeklyHours): Array<{
  days: string;
  hours: string;
}> {
  const result: Array<{ days: string; hours: string }> = [];
  const sortedHours = [...hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  let currentGroup: { days: string[]; hours: string } | null = null;

  for (const dayHours of sortedHours) {
    const dayInfo = DAYS_OF_WEEK[dayHours.dayOfWeek];
    const hoursText =
      dayHours.isClosed || !dayHours.openTime || !dayHours.closeTime
        ? "סגור"
        : `${formatTime(dayHours.openTime)}-${formatTime(dayHours.closeTime)}`;

    if (!currentGroup || currentGroup.hours !== hoursText) {
      if (currentGroup) {
        result.push({
          days: currentGroup.days.join("-"),
          hours: currentGroup.hours,
        });
      }
      currentGroup = { days: [dayInfo.shortHe], hours: hoursText };
    } else {
      currentGroup.days.push(dayInfo.shortHe);
    }
  }

  if (currentGroup) {
    result.push({
      days: currentGroup.days.join("-"),
      hours: currentGroup.hours,
    });
  }

  return result;
}
