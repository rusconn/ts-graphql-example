import { userId } from "../../src/graphql/_adapters/user/id.ts";
import { db } from "../../src/graphql/_testData/db/user.ts";
import type { User } from "../../src/models/user.ts";
import * as UserId from "../../src/models/user/id.ts";
import type * as Graph from "../../src/schema.ts";

import { dateTime } from "./common.ts";

const node = (user: User): Graph.User => ({
  id: userId(user.id),
  createdAt: dateTime(UserId.date(user.id)),
  updatedAt: dateTime(user.updatedAt),
  name: user.name,
  email: user.email,
});

export const token = {
  admin: db.admin.token,
  alice: db.alice.token,
};

export const graph = {
  admin: node(db.admin),
  alice: node(db.alice),
};

export { db };

export const dummyId = () => userId(UserId.gen());
