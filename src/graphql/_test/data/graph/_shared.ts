import type { DateTime } from "../../../../lib/string/date-time.ts";

export type { DateTime };

export const dateTime = (date: Date) => {
  return date.toISOString() as DateTime;
};
