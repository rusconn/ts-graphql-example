import type { DateTime } from "../../src/modules/scalar/_mod.ts";

// DateTime リゾルバーによる変換のシミュレーション
export const dateTime = (date: Date) => date.toISOString() as DateTime;

export const dummySomeId = (nodeId: (id: string) => string, gen: () => string) => () => {
  return nodeId(gen());
};
