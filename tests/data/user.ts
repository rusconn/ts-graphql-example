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
  avatar: user.avatar,
  bio: user.bio,
  email: user.email,
  handle: user.handle,
  location: user.location,
  name: user.name,
  website: user.website,
});

export const token = {
  alice: db.alice.token,
  bob: db.bob.token,
};

export const graph = {
  alice: node(db.alice),
  bob: node(db.bob),
};

export { db };

export const dummyId = () => userId(UserId.gen());
