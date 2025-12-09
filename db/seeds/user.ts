import { faker } from "@faker-js/faker";
import { chunk } from "es-toolkit";
import type { Transaction } from "kysely";

import type { DB } from "../../src/db/types.ts";
import { UserId, UserRole } from "../../src/models/user.ts";

export const seed = async (trx: Transaction<DB>) => {
  const handUsers = [
    {
      /** Date: 2024-12-15T16:54:35.641Z */
      id: "0193cb3e-4379-750f-880f-77afae342259",
      name: "admin",
      email: "admin@admin.com",
      role: UserRole.ADMIN,
      updatedAt: new Date("2024-12-15T16:54:41.152Z"),
    },
    {
      /** Date: 2024-12-15T16:54:38.927Z */
      id: "0193cb3e-504f-72e9-897c-2c71f389f3ad",
      name: "hoge",
      email: "hoge@hoge.com",
      role: UserRole.USER,
      updatedAt: new Date("2024-12-15T16:54:38.927Z"),
    },
    {
      /** Date: 2024-12-15T16:54:41.150Z */
      id: "0193cb3e-58fe-772b-8306-412afa147cdd",
      name: "piyo",
      email: "piyo@piyo.com",
      role: UserRole.USER,
      updatedAt: new Date("2024-12-15T16:54:41.151Z"),
    },
  ];

  const fakeUsers = fakeData(10_000);

  const users = [...handUsers, ...fakeUsers];

  // 一度に insert する件数が多いとエラーが発生するので小分けにしている
  const chunks = chunk(users, 5_000);
  const inserts = chunks.map((us) => trx.insertInto("User").values(us).execute());

  await Promise.all(inserts);

  return fakeUsers.map((user) => user.id);
};

const fakeData = (numFakes: number) => {
  return [...Array(numFakes)].map((_, i) => fakeDataOne(i));
};

const fakeDataOne = (nth: number) => {
  const id = UserId.gen();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    id,
    updatedAt: faker.date.past(),
    name: firstName + lastName,
    email: faker.internet.email({
      firstName,
      lastName: lastName + nth, // make unique
      allowSpecialCharacters: true,
    }),
    role: UserRole.USER,
  };
};
