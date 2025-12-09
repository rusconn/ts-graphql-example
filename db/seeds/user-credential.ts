import { faker } from "@faker-js/faker";
import { chunk } from "es-toolkit";
import type { Transaction } from "kysely";

import type { DB } from "../../src/db/types.ts";
import type { User } from "../../src/models/user.ts";

export const seed = async (trx: Transaction<DB>, userIds: User["id"][]) => {
  const handUserCredentials = [
    {
      userId: "0193cb3e-4379-750f-880f-77afae342259",
      /** raw: adminadmin */
      password: "$2b$10$4YuHiiiZiodsyu7mx18d/OX7CaLC5uH61XX2nHddWabigsfDh87me",
      updatedAt: new Date("2024-12-15T16:54:41.152Z"),
    },
    {
      userId: "0193cb3e-504f-72e9-897c-2c71f389f3ad",
      /** raw: hogehoge */
      password: "$2b$10$RjosB2FTBUCsjBsZm0OmiO3jpWqNmt54ybRybC5C1LnUkERwOSzji",
      updatedAt: new Date("2024-12-15T16:54:38.927Z"),
    },
    {
      userId: "0193cb3e-58fe-772b-8306-412afa147cdd",
      /** raw: piyopiyo */
      password: "$2b$10$tt1xSvAUjwVuBzxaUi.yMugSpVGmka/XfgxtSamq4Zeei7XOC5RK.",
      updatedAt: new Date("2024-12-15T16:54:41.151Z"),
    },
  ];

  const fakeUserCredentials = fakeData(userIds);

  const userCredentials = [...handUserCredentials, ...fakeUserCredentials];

  // 一度に insert する件数が多いとエラーが発生するので小分けにしている
  const chunks = chunk(userCredentials, 5_000);
  const inserts = chunks.map((ucs) => trx.insertInto("UserCredential").values(ucs).execute());

  await Promise.all(inserts);
};

const fakeData = (userIds: User["id"][]) => {
  return userIds.map(fakeDataOne);
};

const fakeDataOne = (userId: User["id"]) => {
  return {
    userId,
    updatedAt: faker.date.past(),
    password: "dummy",
  };
};
