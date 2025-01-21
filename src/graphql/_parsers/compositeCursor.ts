import { colsSep } from "../_adapters/compositeCursor.ts";

export const parseCompositeCursor = (cursor: string) => {
  return cursor.split(colsSep);
};
