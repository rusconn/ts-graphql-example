import type * as Db from "../../src/db/types.ts";
import { UserId } from "../../src/domain/user.ts";
import { db } from "../../src/graphql/_testData/db/users.ts";
import { userEmail } from "../../src/graphql/User/email.ts";
import { userId } from "../../src/graphql/User/id.ts";
import type * as Graph from "../../src/schema.ts";
import { signedJwt } from "../../src/util/accessToken.ts";

const node = (user: Db.User): Graph.User => {
  const email = userEmail(user.email);
  if (Error.isError(email)) {
    throw email;
  }

  return {
    ...user,
    id: userId(user.id),
    email,
  };
};

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
