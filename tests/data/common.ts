import type { DateTime } from "../../src/graphql/DateTime.ts";

// DateTime リゾルバーによる変換のシミュレーション
export const dateTime = (date: Date) => date.toISOString() as DateTime;
