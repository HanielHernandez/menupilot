export type ScheduleEntry = {
  day: string;
  openTime?: string;
  closeTime?: string;
  isClosed?: boolean;
};

/** Normalize browser/time strings to `HH:mm` (accepts `H:mm` and `HH:mm:ss`). */
export function normalizeTimeHHmm(time?: string | null): string {
  const value = time?.trim() ?? "";
  if (!value) return "";

  const match = /^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(value);
  if (!match) return value;

  const hours = Number(match[1]);
  const minutes = match[2];
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

export function isValidTimeHHmm(time?: string | null): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(normalizeTimeHHmm(time));
}

/** Normalize lean/mongoose schedule docs for forms and public views. */
export function mapRestaurantSchedule(
  schedule?: ScheduleEntry[] | null,
): Array<{
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}> {
  if (!schedule?.length) return [];
  return schedule.map((entry) => ({
    day: entry.day?.trim() ?? "",
    openTime: normalizeTimeHHmm(entry.openTime),
    closeTime: normalizeTimeHHmm(entry.closeTime),
    isClosed: Boolean(entry.isClosed),
  }));
}

/** Convert "HH:mm" (24h) to a 12-hour label like "8:00 AM". */
export function formatTime12h(time?: string | null): string {
  const value = time?.trim() ?? "";
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return value;

  const hours24 = Number(match[1]);
  const minutes = match[2];
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${minutes} ${period}`;
}

/** Format one schedule row for public display. */
export function formatScheduleRow(entry: ScheduleEntry): string {
  const day = entry.day.trim() || "—";
  if (entry.isClosed) {
    return `${day}\tClosed`;
  }

  const open = formatTime12h(entry.openTime);
  const close = formatTime12h(entry.closeTime);
  if (!open || !close) {
    return day;
  }

  return `${day}\t${open} - ${close}`;
}

export function formatScheduleLines(schedule: ScheduleEntry[]): string[] {
  return schedule
    .filter((entry) => entry.day?.trim())
    .map((entry) => formatScheduleRow(entry));
}
