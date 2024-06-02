import { faker } from "@faker-js/faker";
import { chunk } from "remeda";
import { ulid } from "ulid";

import { TodoStatus, type User, db } from "@/db/mod.ts";
import { randInt } from "./common.ts";

export const seed = async (userIds: User["id"][]) => {
  const handTodos = [
    {
      id: "01HFFZ0ABV8BJPJX50Z2PJ3DR9",
      createdAt: new Date(3),
      updatedAt: new Date(7),
      title: "hoge todo 1",
      description: "hoge desc 1",
      status: TodoStatus.PENDING,
      userId: "01HFFYQP8H8628NYKTK2ZCNCBV",
    },
    {
      id: "01HFFZ0ABVVD5HPAARMZR74PHG",
      createdAt: new Date(4),
      updatedAt: new Date(4),
      title: "piyo todo 1",
      description: "piyo desc 1",
      status: TodoStatus.DONE,
      userId: "01HFFYQP8JMVAJ11XVZXDXVGQR",
    },
    {
      id: "01HFFZ0ABV43SDH3EGT46AM6P1",
      createdAt: new Date(5),
      updatedAt: new Date(6),
      title: "piyo todo 2",
      description: "piyo desc 2",
      status: TodoStatus.PENDING,
      userId: "01HFFYQP8JMVAJ11XVZXDXVGQR",
    },
  ];

  const fakeTodos = fakeData(userIds);

  const todos = [...handTodos, ...fakeTodos];

  // 一度に insert する件数が多いとエラーが発生するので小分けにしている
  const chunks = chunk(todos, 5_000);
  const inserts = chunks.map((ts) => db.insertInto("Todo").values(ts).execute());

  await Promise.all(inserts);
};

const fakeData = (userIds: User["id"][]) => {
  return userIds.flatMap(fakeDataOne);
};

const fakeDataOne = (userId: User["id"]) => {
  const numTodos = randInt(0, 10);

  return [...Array(numTodos)].map((_) => ({
    id: ulid(),
    title: faker.lorem.words(randInt(1, 3)),
    description: faker.lorem.text(),
    status: faker.helpers.arrayElement([TodoStatus.DONE, TodoStatus.PENDING]),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    userId,
  }));
};
