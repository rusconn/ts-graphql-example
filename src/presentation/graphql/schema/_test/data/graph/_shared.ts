import type { DateTimeISO } from "../../../DateTimeISO.ts";

export type { DateTimeISO };

export function dateTimeISO(date: Date) {
  return date.toISOString() as DateTimeISO;
}
