import type { DateTime } from "../../src/lib/string/dateTime.ts";

// DateTime リゾルバーによる変換のシミュレーション
export const dateTime = (date: Date) => date.toISOString() as DateTime;
