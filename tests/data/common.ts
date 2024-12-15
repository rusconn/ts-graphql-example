import { v7 as uuidv7 } from "uuid";

import { dateByUuid } from "../../src/modules/common/resolvers.ts";
import type { DateTime } from "../../src/modules/scalar/mod.ts";

// DateTime リゾルバーによる変換のシミュレーション
export const dateTime = (date: Date) => date.toISOString() as DateTime;

export const dateTimeByUuid = (id: Parameters<typeof dateByUuid>[0]) => {
  const date = dateByUuid(id);
  return dateTime(date);
};

export const dummySomeNodeId = (nodeId: (id: string) => string) => () => {
  return nodeId(uuidv7());
};
