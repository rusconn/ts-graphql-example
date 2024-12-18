import type { UserSelect } from "../../src/db/models.ts";
import { db } from "../../src/modules/common/testData/db/user.ts";
import { userId } from "../../src/modules/user/adapters/id.ts";
import * as internalId from "../../src/modules/user/internal/id.ts";
import type * as Graph from "../../src/schema.ts";

import { dateTime, dummySomeId } from "./common.ts";

const node = (user: UserSelect): Graph.User => ({
  id: userId(user.id),
  createdAt: dateTime(internalId.date(user.id)),
  updatedAt: dateTime(user.updatedAt),
  avatar: user.avatar,
  bio: user.bio,
  email: user.email,
  handle: user.handle,
  location: user.location,
  name: user.name,
  website: user.website,
});

export const graph = {
  alice: node(db.alice),
  bob: node(db.bob),
};

export { db };

export const dummyId = dummySomeId(userId, internalId.gen);
