import { chunk } from "es-toolkit";
import type { Transaction } from "kysely";

import type { Credential, DB, User } from "../../src/infrastructure/datasources/_shared/types.ts";
import type { Uuidv7 } from "../../src/util/uuid/v7.ts";

export const seed = async (trx: Transaction<DB>, userIds: User["id"][]) => {
  const handCredentials: Credential[] = [
    {
      userId: "0193cb3e-4379-750f-880f-77afae342259" as Uuidv7,
      /** raw: adminadmin */
      password: "$2b$10$4YuHiiiZiodsyu7mx18d/OX7CaLC5uH61XX2nHddWabigsfDh87me",
    },
    {
      userId: "0193cb3e-504f-72e9-897c-2c71f389f3ad" as Uuidv7,
      /** raw: hogehoge */
      password: "$2b$10$RjosB2FTBUCsjBsZm0OmiO3jpWqNmt54ybRybC5C1LnUkERwOSzji",
    },
    {
      userId: "0193cb3e-58fe-772b-8306-412afa147cdd" as Uuidv7,
      /** raw: piyopiyo */
      password: "$2b$10$tt1xSvAUjwVuBzxaUi.yMugSpVGmka/XfgxtSamq4Zeei7XOC5RK.",
    },
  ];

  const fakeCredentials = fakeData(userIds);

  const credentials = [...handCredentials, ...fakeCredentials];

  // 一度に insert する件数が多いとエラーが発生するので小分けにしている
  const chunks = chunk(credentials, 5_000);
  const inserts = chunks.map((cs) => trx.insertInto("credentials").values(cs).execute());

  await Promise.all(inserts);
};

const fakeData = (userIds: User["id"][]) => {
  return userIds.map(fakeDataOne);
};

const fakeDataOne = (userId: User["id"]): Credential => {
  return {
    userId,
    password: "dummy",
  };
};
