import { faker } from "@faker-js/faker";
import { chunk } from "es-toolkit";
import type { Transaction } from "kysely";

import type { DB, User } from "../../src/db/types.ts";
import * as userToken from "../../src/models/user/token.ts";

export const seed = async (trx: Transaction<DB>, userIds: User["id"][]) => {
  const handUserTokens = [
    {
      userId: "0193cb3e-4379-750f-880f-77afae342259",
      updatedAt: new Date("2024-12-15T16:54:41.152Z"),
      token: "0193cb3e-4b23-75ba-a4d8-802869ed8951",
    },
    {
      userId: "0193cb3e-504f-72e9-897c-2c71f389f3ad",
      updatedAt: new Date("2024-12-15T16:54:38.927Z"),
      token: "0193cb3e-5576-752c-b9e1-404be1fb777e",
    },
    {
      userId: "0193cb3e-58fe-772b-8306-412afa147cdd",
      updatedAt: new Date("2024-12-15T16:54:41.151Z"),
      token: "0193cb3e-5c56-76ff-a5a4-c692182e3749",
    },
  ];

  // 8割のユーザーがログイン中と想定
  const loggedInUserIds = userIds.slice(0, Math.round(userIds.length * 0.8));
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
