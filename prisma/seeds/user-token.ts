import { faker } from "@faker-js/faker";
import { chunk } from "es-toolkit";
import type { Transaction } from "kysely";

import type { DB, User } from "../../src/db/types.ts";
import * as userToken from "../../src/models/user/token.ts";

export const seed = async (trx: Transaction<DB>, userIds: User["id"][]) => {
  const [aliceId, bobId, ...fakeUserIds] = userIds as [string, string, ...string[]];

  const handUserTokens = [
    {
      userId: aliceId,
      updatedAt: new Date("2024-12-15T16:54:38.927Z"),
      token: "0193cb3e-5576-752c-b9e1-404be1fb777e",
    },
    {
      userId: bobId,
      updatedAt: new Date("2024-12-15T16:54:41.151Z"),
      token: "0193cb3e-5c56-76ff-a5a4-c692182e3749",
    },
  ];

  // 8割のユーザーがログイン中と想定
  const loggedInUserIds = fakeUserIds.slice(0, Math.round(userIds.length * 0.8));
  const fakeUserTokens = fakeData(loggedInUserIds);

  const userTokens = [...handUserTokens, ...fakeUserTokens];

  // 一度に insert する件数が多いとエラーが発生するので小分けにしている
  const chunks = chunk(userTokens, 5_000);
  const inserts = chunks.map((uts) => trx.insertInto("UserToken").values(uts).execute());

  await Promise.all(inserts);
};

const fakeData = (userIds: User["id"][]) => {
  return userIds.map(fakeDataOne);
};

const fakeDataOne = (userId: User["id"]) => {
  return {
    userId,
    updatedAt: faker.date.past(),
    token: userToken.gen(),
  };
};
