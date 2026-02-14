import type { DateTime } from "../../../src/lib/string/date-time.ts";

export type { DateTime };

// DateTime リゾルバーによる変換のシミュレーション
export const dateTime = (date: Date) => {
  return date.toISOString() as DateTime;
};
