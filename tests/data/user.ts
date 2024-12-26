import type { UserSelect } from "../../src/db/models.ts";
import { db } from "../../src/modules/common/testData/db/user.ts";
import { userId } from "../../src/modules/user/adapters/id.ts";
import * as internalId from "../../src/modules/user/internal/id.ts";
import type * as Graph from "../../src/schema.ts";

import { dateTime } from "./common.ts";

const node = (user: UserSelect): Graph.User => ({
  id: userId(user.id),
  createdAt: dateTime(internalId.date(user.id)),
  updatedAt: dateTime(user.updatedAt),
  name: user.name,
  email: user.email,
});

export const graph = {
  admin: node(db.admin),
  alice: node(db.alice),
};

export { db };

export const dummyId = () => userId(internalId.gen());
