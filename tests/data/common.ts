import * as uuidv7 from "../../src/lib/uuid/v7.ts";
import type { DateTime } from "../../src/modules/scalar/_mod.ts";

// DateTime リゾルバーによる変換のシミュレーション
export const dateTime = (date: Date) => date.toISOString() as DateTime;

export const dateTimeByUuid = (id: Parameters<typeof uuidv7.date>[0]) => {
  const date = uuidv7.date(id);
  return dateTime(date);
};

export const dummySomeId = (nodeId: (id: string) => string) => () => {
  return nodeId(uuidv7.gen());
};
