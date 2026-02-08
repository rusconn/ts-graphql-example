import { faker } from "@faker-js/faker";
import { chunk } from "es-toolkit";
import type { Transaction } from "kysely";

import type { DB, User, RefreshToken } from "../../src/infra/datasources/_shared/types.ts";
import type { Uuidv7 } from "../../src/lib/uuid/v7.ts";

export const seed = async (trx: Transaction<DB>, userIds: User["id"][]) => {
  const handRefreshTokens: RefreshToken[] = [
    {
      /** raw: ddfe9c8c-6a73-435d-aa91-7ead331aab0c */
      token: "$2b$10$nOpVuJk/aqONHB/jIDq9BOIu5LcRAjr0/rGsYNui3Ep8h.2X3glee",
      userId: "0193cb3e-4379-750f-880f-77afae342259" as Uuidv7,
      lastUsedAt: new Date(),
    },
    {
      /** raw: e9b7e901-5fe4-4088-a8c5-96f934707c56 */
      token: "$2b$10$j7tyBjZUd.J3c2dMNiNLXOMhZyxYzMYo46A0CFoajklUE9B4NFCpm",
      userId: "0193cb3e-504f-72e9-897c-2c71f389f3ad" as Uuidv7,
      lastUsedAt: new Date(),
    },
    {
      /** raw: c91fcf2d-5b15-451b-885b-a93b88094961 */
      token: "$2b$10$odhfjMJlp9z97D9g7mzVd..2sPvEYBTNssSmY0vHSuP2v7Okh/CJ.",
      userId: "0193cb3e-58fe-772b-8306-412afa147cdd" as Uuidv7,
      lastUsedAt: new Date(),
    },
  ];

  // 8割のユーザーがログイン中と想定
  const loggedInUserIds = userIds.slice(0, Math.round(userIds.length * 0.8));
  const fakeRefreshTokens = fakeData(loggedInUserIds);

  const refreshTokens = [...handRefreshTokens, ...fakeRefreshTokens];

  // 一度に insert する件数が多いとエラーが発生するので小分けにしている
  const chunks = chunk(refreshTokens, 5_000);
  const inserts = chunks.map((uts) => trx.insertInto("refreshTokens").values(uts).execute());

  await Promise.all(inserts);
};

const fakeData = (userIds: User["id"][]) => {
  return userIds.map(fakeDataOne);
};

const fakeDataOne = (userId: User["id"]): RefreshToken => {
  return {
    token: `dummy-${userId}`,
    userId,
    lastUsedAt: faker.date.past(),
  };
};
