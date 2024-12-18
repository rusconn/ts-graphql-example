import * as internalId from "../../src/db/models/user/id.ts";
import { db } from "../../src/modules/common/testData/db/user.ts";
import { userId } from "../../src/modules/user/adapters/id.ts";
import type { User } from "../../src/modules/user/mapper.ts";
import type * as Graph from "../../src/schema.ts";

import { dateTime } from "./common.ts";

const node = (user: User): Graph.User => ({
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

export const dummyId = () => userId(internalId.gen());
