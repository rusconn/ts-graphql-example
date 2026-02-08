import type { DateTime } from "../../../src/lib/string/dateTime.ts";

export type { DateTime };

// DateTime リゾルバーによる変換のシミュレーション
export const dateTime = (date: Date) => {
  return date.toISOString() as DateTime;
};
