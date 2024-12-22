import * as uuid from "../../../lib/uuid.ts";
import { parseErr } from "./util.ts";

export const parseCursor = (id: string) => {
  if (!uuid.is(id)) {
    return parseErr(`invalid cursor: ${id}`);
  }

  return id;
};
