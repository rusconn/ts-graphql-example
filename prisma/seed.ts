import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import { ulid } from "ulid";

import { TodoStatus, UserRole, prisma } from "@/prisma/mod.ts";

const main = async () => {
  const handUsers = [
    {
      id: "01HFFYQP8GEG9ATV44YH6XNJ1V",
      name: "admin",
      email: "admin@admin.com",
      /** raw: adminadmin */
      password: "$2b$10$4YuHiiiZiodsyu7mx18d/OX7CaLC5uH61XX2nHddWabigsfDh87me",
      token: "01HFFYQP8HTEHXJJ3DSTVPPBC0",
      role: UserRole.ADMIN,
    },
    {
      id: "01HFFYQP8H8628NYKTK2ZCNCBV",
      name: "hoge",
      email: "hoge@hoge.com",
      /** raw: hogehoge */
      password: "$2b$10$RjosB2FTBUCsjBsZm0OmiO3jpWqNmt54ybRybC5C1LnUkERwOSzji",
      token: "01HFFYQP8H9PRG5DKFES044S5D",
      role: UserRole.USER,
    },
    {
      id: "01HFFYQP8JMVAJ11XVZXDXVGQR",
      name: "piyo",
      email: "piyo@piyo.com",
      /** raw: piyopiyo */
      password: "$2b$10$tt1xSvAUjwVuBzxaUi.yMugSpVGmka/XfgxtSamq4Zeei7XOC5RK.",
      token: "01HFFYQP8JW273G541HW4TREQY",
      role: UserRole.USER,
    },
  ];

  const handTodos = [
    {
      id: "01HFFZ0ABV8BJPJX50Z2PJ3DR9",
      title: "hoge todo 1",
      description: "hoge desc 1",
      status: TodoStatus.PENDING,
      userId: "01HFFYQP8GEG9ATV44YH6XNJ1V",
    },
    {
      id: "01HFFZ0ABVVD5HPAARMZR74PHG",
      title: "piyo todo 1",
      description: "piyo desc 1",
      status: TodoStatus.DONE,
      userId: "01HFFYQP8JMVAJ11XVZXDXVGQR",
    },
    {
      id: "01HFFZ0ABV43SDH3EGT46AM6P1",
      title: "piyo todo 2",
      description: "piyo desc 2",
      status: TodoStatus.PENDING,
      userId: "01HFFYQP8JMVAJ11XVZXDXVGQR",
    },
  ];

  const { fakeUsers, fakeTodos } = fakeData(10_000);

  const users = [...handUsers, ...fakeUsers];
  const todos = [...handTodos, ...fakeTodos];

  await prisma.user.createMany({ data: users });
  await prisma.todo.createMany({ data: todos });
};

const fakeData = (numFakes: number) => {
  const data = [...Array(numFakes)].map((_, i) => fakeDataOne(i));

  return {
    fakeUsers: data.map(({ user }) => user),
    fakeTodos: data.flatMap(({ todos }) => todos),
  };
};

const fakeDataOne = (nth: number) => {
  const userId = ulid();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  const user = {
    id: userId,
    name: firstName + lastName,
    email: faker.internet.email({
      firstName,
      lastName: lastName + nth, // make unique
      allowSpecialCharacters: true,
    }),
    password: bcrypt.hashSync(faker.string.alphanumeric({ length: 8, casing: "mixed" }), 4),
    token: ulid(),
    role: UserRole.USER,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };

  const numTodos = randInt(0, 10);

  const todos = [...Array(numTodos)].map(_ => ({
    id: ulid(),
    title: faker.lorem.words(randInt(1, 3)),
    description: faker.lorem.text(),
    status: faker.helpers.arrayElement([TodoStatus.DONE, TodoStatus.PENDING]),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    userId,
  }));

  return { user, todos };
};

const randInt = (minInclusive: number, maxInclusive: number) => {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1) + minInclusive);
};

try {
  await main();
} catch (e) {
  console.error(e);
} finally {
  await prisma.$disconnect();
}
