/** Hardcoded plan caps — swap for plan-based limits later. */
export const MAX_STORAGE_BYTES = 2 * 1024 ** 3; // 2GB
export const MAX_MENU_PROCESSES_PER_DAY = 3;

export const USAGE_EVENT_TYPES = ["menu_process"] as const;
export type UsageEventType = (typeof USAGE_EVENT_TYPES)[number];

/** UTC calendar day key, e.g. 2026-08-04 */
export function getUtcDayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

export function storageLimitErrorMessage(): string {
  return `Storage limit reached (${formatBytes(MAX_STORAGE_BYTES)}). Delete unused media or free space before uploading.`;
}

export function menuProcessLimitErrorMessage(): string {
  return `Daily menu process limit reached (${MAX_MENU_PROCESSES_PER_DAY}/day). Try again tomorrow.`;
}
