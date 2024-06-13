import { dateByUlid } from "@/modules/common/resolvers";
import type { DateTime } from "@/modules/scalar/mod.ts";

// DateTime リゾルバーによる変換のシミュレーション
export const dateTime = (date: Date) => date.toISOString() as DateTime;

export const dateTimeByUlid = (id: Parameters<typeof dateByUlid>[0]) => {
  const date = dateByUlid(id);
  return dateTime(date);
};
