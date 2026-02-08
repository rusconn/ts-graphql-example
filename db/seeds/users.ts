import { faker } from "@faker-js/faker";
import { chunk } from "es-toolkit";
import type { Transaction } from "kysely";

import { type DB, type User, UserRole } from "../../src/infra/datasources/_shared/types.ts";
import * as Domain from "../../src/domain/models.ts";
import type { Uuidv7 } from "../../src/lib/uuid/v7.ts";

export const seed = async (trx: Transaction<DB>) => {
  const handUsers: User[] = [
    {
      id: "0193cb3e-4379-750f-880f-77afae342259" as Uuidv7,
      name: "admin",
      email: "admin@example.com",
      role: UserRole.Admin,
      createdAt: new Date("2024-12-15T16:54:35.641Z"),
      updatedAt: new Date("2024-12-15T16:54:41.152Z"),
    },
    {
      id: "0193cb3e-504f-72e9-897c-2c71f389f3ad" as Uuidv7,
      name: "hoge",
      email: "hoge@example.com",
      role: UserRole.User,
      createdAt: new Date("2024-12-15T16:54:38.927Z"),
      updatedAt: new Date("2024-12-15T16:54:38.927Z"),
    },
    {
      id: "0193cb3e-58fe-772b-8306-412afa147cdd" as Uuidv7,
      name: "piyo",
      email: "piyo@example.com",
      role: UserRole.User,
      createdAt: new Date("2024-12-15T16:54:41.150Z"),
      updatedAt: new Date("2024-12-15T16:54:41.151Z"),
    },
  ];

  const fakeUsers = fakeData(10_000);

  const users = [...handUsers, ...fakeUsers];

  // 一度に insert する件数が多いとエラーが発生するので小分けにしている
  const chunks = chunk(users, 5_000);
  const inserts = chunks.map((us) => trx.insertInto("users").values(us).execute());

  await Promise.all(inserts);

  return fakeUsers.map((user) => user.id);
};

const fakeData = (numFakes: number) => {
  return [...Array(numFakes)].map((_, i) => fakeDataOne(i));
};

const fakeDataOne = (nth: number): User => {
  const id = Domain.User.Id.create();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    id,
    name: firstName + lastName,
    email: faker.internet.email({
      firstName,
      lastName: lastName + nth, // make unique
      allowSpecialCharacters: true,
    }),
    role: UserRole.User,
    createdAt: Domain.User.Id.date(id),
    updatedAt: faker.date.past(),
  };
};
