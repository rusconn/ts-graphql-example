import type { DateTimeISO } from "../../../DateTimeISO.ts";

export type { DateTimeISO };

export const dateTimeISO = (date: Date) => {
  return date.toISOString() as DateTimeISO;
};
