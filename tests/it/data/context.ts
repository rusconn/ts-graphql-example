import pick from "lodash/pick";

import * as DBData from "./db";

export const admin = pick(DBData.admin, ["id", "role"]);
export const alice = pick(DBData.alice, ["id", "role"]);
export const bob = pick(DBData.bob, ["id", "role"]);

export const guest = {
  id: "GUEST",
  role: "GUEST",
} as const;
