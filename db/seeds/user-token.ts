import { faker } from "@faker-js/faker";
import { chunk } from "es-toolkit";
import type { Transaction } from "kysely";

import type { DB } from "../../src/db/types.ts";
import type { User } from "../../src/models/user.ts";

export const seed = async (trx: Transaction<DB>, userIds: User["id"][]) => {
  const handUserTokens = [
    {
      userId: "0193cb3e-4379-750f-880f-77afae342259",
      /** raw: ddfe9c8c-6a73-435d-aa91-7ead331aab0c */
      token: "$2b$10$nOpVuJk/aqONHB/jIDq9BOIu5LcRAjr0/rGsYNui3Ep8h.2X3glee",
      updatedAt: new Date("2024-12-15T16:54:41.152Z"),
    },
    {
      userId: "0193cb3e-504f-72e9-897c-2c71f389f3ad",
      /** raw: e9b7e901-5fe4-4088-a8c5-96f934707c56 */
      token: "$2b$10$j7tyBjZUd.J3c2dMNiNLXOMhZyxYzMYo46A0CFoajklUE9B4NFCpm",
      updatedAt: new Date("2024-12-15T16:54:38.927Z"),
    },
    {
      userId: "0193cb3e-58fe-772b-8306-412afa147cdd",
      /** raw: c91fcf2d-5b15-451b-885b-a93b88094961 */
      token: "$2b$10$odhfjMJlp9z97D9g7mzVd..2sPvEYBTNssSmY0vHSuP2v7Okh/CJ.",
      updatedAt: new Date("2024-12-15T16:54:41.151Z"),
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
    token: `dummy-${userId}`,
  };
};
