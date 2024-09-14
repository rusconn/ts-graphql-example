import type { UserSelect } from "@/db/models.ts";
import type * as Graph from "@/modules/common/schema.ts";
import { db } from "@/modules/common/testData/db/user.ts";
import { userNodeId } from "@/modules/user/common/adapter.ts";

import { dateTime, dateTimeByUlid } from "./common.ts";

const node = (user: UserSelect): Graph.User => ({
  id: userNodeId(user.id),
  createdAt: dateTimeByUlid(user.id),
  updatedAt: dateTime(user.updatedAt),
  name: user.name,
  email: user.email,
  token: user.token,
});

export const graph = {
  admin: node(db.admin),
  alice: node(db.alice),
};

export { db };
