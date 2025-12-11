import { userId } from "../../src/graphql/_adapters/user/id.ts";
import { db } from "../../src/graphql/_testData/db/users.ts";
import { type User, UserId } from "../../src/models/user.ts";
import type * as Graph from "../../src/schema.ts";
import { signedJwt } from "../../src/util/accessToken.ts";

import { dateTime } from "./common.ts";

const node = (user: User): Graph.User => ({
  ...user,
  id: userId(user.id),
  createdAt: dateTime(UserId.date(user.id)),
  updatedAt: dateTime(user.updatedAt),
});

export const token = {
  admin: await signedJwt(db.admin),
  alice: await signedJwt(db.alice),
};

export const refreshToken = {
  admin: "33e9adb5-d716-4388-86a1-6885e6499eec",
  alice: "a5ef8ce5-82cd-418c-9a72-4c43cfa30c9c",
};

export const graph = {
  admin: node(db.admin),
  alice: node(db.alice),
};

export { db };

export const dummyId = () => {
  return userId(UserId.gen());
};
