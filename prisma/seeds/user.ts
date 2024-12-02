import { faker } from "@faker-js/faker";
import { chunk } from "es-toolkit";
import type { Transaction } from "kysely";
import { ulid } from "ulid";

import { type DB, UserRole } from "../../src/db/types.ts";

export const seed = async (tsx: Transaction<DB>) => {
  const handUsers = [
    {
      /** Date: 2023-11-18T00:54:17.616Z */
      id: "01HFFYQP8GEG9ATV44YH6XNJ1V",
      updatedAt: new Date("2023-11-18T00:54:17.620Z"),
      name: "admin",
      email: "admin@admin.com",
      /** raw: adminadmin */
      password: "$2b$10$4YuHiiiZiodsyu7mx18d/OX7CaLC5uH61XX2nHddWabigsfDh87me",
      token: "01HFFYQP8HTEHXJJ3DSTVPPBC0",
      role: UserRole.ADMIN,
    },
    {
      /** Date: 2023-11-18T00:54:17.617Z */
      id: "01HFFYQP8H8628NYKTK2ZCNCBV",
      updatedAt: new Date("2023-11-18T00:54:17.617Z"),
      name: "hoge",
      email: "hoge@hoge.com",
      /** raw: hogehoge */
      password: "$2b$10$RjosB2FTBUCsjBsZm0OmiO3jpWqNmt54ybRybC5C1LnUkERwOSzji",
      token: "01HFFYQP8H9PRG5DKFES044S5D",
      role: UserRole.USER,
    },
    {
      /** Date: 2023-11-18T00:54:17.618Z */
      id: "01HFFYQP8JMVAJ11XVZXDXVGQR",
      updatedAt: new Date("2023-11-18T00:54:17.619Z"),
      name: "piyo",
      email: "piyo@piyo.com",
      /** raw: piyopiyo */
      password: "$2b$10$tt1xSvAUjwVuBzxaUi.yMugSpVGmka/XfgxtSamq4Zeei7XOC5RK.",
      token: "01HFFYQP8JW273G541HW4TREQY",
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
  const userId = ulid();
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
    token: ulid(),
    role: UserRole.USER,
    updatedAt: faker.date.past(),
  };
};
