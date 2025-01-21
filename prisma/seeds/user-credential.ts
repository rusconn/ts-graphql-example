import { faker } from "@faker-js/faker";
import { chunk } from "es-toolkit";
import type { Transaction } from "kysely";

import type { DB, User } from "../../src/db/types.ts";

export const seed = async (trx: Transaction<DB>, userIds: User["id"][]) => {
  const [aliceId, bobId, ...fakeUserIds] = userIds as [string, string, ...string[]];

  const handUserCredentials = [
    {
      userId: aliceId,
      updatedAt: new Date("2024-12-15T16:54:38.927Z"),
      /** raw: hogehoge */
      password: "$2b$10$RjosB2FTBUCsjBsZm0OmiO3jpWqNmt54ybRybC5C1LnUkERwOSzji",
    },
    {
      userId: bobId,
      updatedAt: new Date("2024-12-15T16:54:41.151Z"),
      /** raw: piyopiyo */
      password: "$2b$10$tt1xSvAUjwVuBzxaUi.yMugSpVGmka/XfgxtSamq4Zeei7XOC5RK.",
    },
  ];

  const fakeUserCredentials = fakeData(fakeUserIds);

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
