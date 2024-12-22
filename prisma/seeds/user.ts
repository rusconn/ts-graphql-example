import { faker } from "@faker-js/faker";
import { chunk } from "es-toolkit";
import type { Transaction } from "kysely";

import { type DB, UserRole } from "../../src/db/types.ts";
import * as uuidv7 from "../../src/lib/uuidv7.ts";

export const seed = async (tsx: Transaction<DB>) => {
  const handUsers = [
    {
      /** Date: 2024-12-15T16:54:35.641Z */
      id: "0193cb3e-4379-750f-880f-77afae342259",
      updatedAt: new Date("2024-12-15T16:54:41.152Z"),
      name: "admin",
      email: "admin@admin.com",
      /** raw: adminadmin */
      password: "$2b$10$4YuHiiiZiodsyu7mx18d/OX7CaLC5uH61XX2nHddWabigsfDh87me",
      token: "0193cb3e-4b23-75ba-a4d8-802869ed8951",
      role: UserRole.ADMIN,
    },
    {
      /** Date: 2024-12-15T16:54:38.927Z */
      id: "0193cb3e-504f-72e9-897c-2c71f389f3ad",
      updatedAt: new Date("2024-12-15T16:54:38.927Z"),
      name: "hoge",
      email: "hoge@hoge.com",
      /** raw: hogehoge */
      password: "$2b$10$RjosB2FTBUCsjBsZm0OmiO3jpWqNmt54ybRybC5C1LnUkERwOSzji",
      token: "0193cb3e-5576-752c-b9e1-404be1fb777e",
      role: UserRole.USER,
    },
    {
      /** Date: 2024-12-15T16:54:41.150Z */
      id: "0193cb3e-58fe-772b-8306-412afa147cdd",
      updatedAt: new Date("2024-12-15T16:54:41.151Z"),
      name: "piyo",
      email: "piyo@piyo.com",
      /** raw: piyopiyo */
      password: "$2b$10$tt1xSvAUjwVuBzxaUi.yMugSpVGmka/XfgxtSamq4Zeei7XOC5RK.",
      token: "0193cb3e-5c56-76ff-a5a4-c692182e3749",
      role: UserRole.USER,
    },
  ];

  const fakeUsers = fakeData(10_000);

  const users = [...handUsers, ...fakeUsers];

  // 一度に insert する件数が多いとエラーが発生するので小分けにしている
  const chunks = chunk(users, 5_000);
  const inserts = chunks.map((us) => tsx.insertInto("User").values(us).execute());

  await Promise.all(inserts);

  return fakeUsers.map((user) => user.id);
};

const fakeData = (numFakes: number) => {
  return [...Array(numFakes)].map((_, i) => fakeDataOne(i));
};

const fakeDataOne = (nth: number) => {
  const userId = uuidv7.gen();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    id: userId,
    name: firstName + lastName,
    email: faker.internet.email({
      firstName,
      lastName: lastName + nth, // make unique
      allowSpecialCharacters: true,
    }),
    password: "dummy",
    token: uuidv7.gen(),
    role: UserRole.USER,
    updatedAt: faker.date.past(),
  };
};
