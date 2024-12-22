import type { UserSelect } from "../../src/db/models.ts";
import { db } from "../../src/modules/common/testData/db/user.ts";
import { userNodeId } from "../../src/modules/user/adapters/id.ts";
import type * as Graph from "../../src/schema.ts";

import { dateTime, dateTimeByUuid, dummySomeNodeId } from "./common.ts";

const node = (user: UserSelect): Graph.User => ({
  id: userNodeId(user.id),
  createdAt: dateTimeByUuid(user.id),
  updatedAt: dateTime(user.updatedAt),
  name: user.name,
  email: user.email,
});

export const graph = {
  admin: node(db.admin),
  alice: node(db.alice),
};

export { db };

export const dummyNodeId = dummySomeNodeId(userNodeId);
