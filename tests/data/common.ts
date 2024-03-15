import type { DateTime } from "@/modules/scalar/mod.ts";

// DateTime リゾルバーによる変換のシミュレーション
export const dateTime = (date: Date) => date.toISOString() as DateTime;
