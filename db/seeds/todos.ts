import { faker } from "@faker-js/faker";
import { chunk } from "es-toolkit";
import type { Transaction } from "kysely";

import { type DB, TodoStatus, type User } from "../../src/db/types.ts";
import { TodoId } from "../../src/domain/todo.ts";
import type { Uuidv7 } from "../../src/lib/uuid/v7.ts";

import { randInt } from "./_utils.ts";

export const seed = async (trx: Transaction<DB>, userIds: User["id"][]) => {
  const handTodos = [
    {
      id: "0193cb3e-5fdd-7264-9f70-1df63d84b251" as Uuidv7,
      title: "hoge todo 1",
      description: "hoge desc 1",
      status: TodoStatus.Pending,
      userId: "0193cb3e-504f-72e9-897c-2c71f389f3ad" as Uuidv7,
      createdAt: new Date("2024-12-15T16:54:42.909Z"),
      updatedAt: new Date("2024-12-15T16:54:44.697Z"),
    },
    {
      id: "0193cb3e-636d-742e-8cc9-02a6a85dbf00" as Uuidv7,
      title: "piyo todo 1",
      description: "piyo desc 1",
      status: TodoStatus.Done,
      userId: "0193cb3e-58fe-772b-8306-412afa147cdd" as Uuidv7,
      createdAt: new Date("2024-12-15T16:54:43.821Z"),
      updatedAt: new Date("2024-12-15T16:54:43.821Z"),
    },
    {
      id: "0193cb3e-66d7-7295-bbba-8fe8ec408177" as Uuidv7,
      title: "piyo todo 2",
      description: "piyo desc 2",
      status: TodoStatus.Pending,
      userId: "0193cb3e-58fe-772b-8306-412afa147cdd" as Uuidv7,
      createdAt: new Date("2024-12-15T16:54:44.695Z"),
      updatedAt: new Date("2024-12-15T16:54:44.696Z"),
    },
  ];

  const fakeTodos = fakeData(userIds);

  const todos = [...handTodos, ...fakeTodos];

  // 一度に insert する件数が多いとエラーが発生するので小分けにしている
  const chunks = chunk(todos, 5_000);
  const inserts = chunks.map((ts) => trx.insertInto("todos").values(ts).execute());

  await Promise.all(inserts);
};

const fakeData = (userIds: User["id"][]) => {
  return userIds.flatMap(fakeDataOne);
};

const fakeDataOne = (userId: User["id"]) => {
  const numTodos = randInt(0, 10);

  return [...Array(numTodos)].map((_) => {
    const id = TodoId.gen();

    return {
      id,
      title: faker.lorem.words(randInt(1, 3)),
      description: faker.lorem.text(),
      status: faker.helpers.arrayElement([TodoStatus.Done, TodoStatus.Pending]),
      userId,
      createdAt: TodoId.date(id),
      updatedAt: faker.date.past(),
    };
  });
};
