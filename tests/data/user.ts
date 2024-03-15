import type * as Graph from "@/modules/common/schema.ts";
import { userNodeId } from "@/modules/user/common/adapter.ts";
import { db } from "@/modules/user/common/test.ts";
import * as Prisma from "@/prisma/mod.ts";

import { dateTime } from "./common.ts";

const node = (user: Prisma.User): Graph.User => ({
  id: userNodeId(user.id),
  createdAt: dateTime(user.createdAt),
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
