import bcrypt from "bcrypt";

import { passwordHashRoundsExponent } from "@/config.ts";
import { type User, prisma, Role, TodoStatus } from "@/prisma/mod.ts";

const main = async () => {
  const users = await createUsers();
  await createTodos(users);
};

const createUsers = async () => {
  const rawData = [
    {
      id: "01HFFYQP8GEG9ATV44YH6XNJ1V",
      name: "admin",
      email: "admin@admin.com",
      rawPassword: "adminadmin",
      token: "01HFFYQP8HTEHXJJ3DSTVPPBC0",
      role: Role.ADMIN,
    },
    {
      id: "01HFFYQP8H8628NYKTK2ZCNCBV",
      name: "hoge",
      email: "hoge@hoge.com",
      rawPassword: "hogehoge",
      token: "01HFFYQP8H9PRG5DKFES044S5D",
      role: Role.USER,
    },
    {
      id: "01HFFYQP8JMVAJ11XVZXDXVGQR",
      name: "piyo",
      email: "piyo@piyo.com",
      rawPassword: "piyopiyo",
      token: "01HFFYQP8JW273G541HW4TREQY",
      role: Role.USER,
    },
  ];

  const dataPromises = rawData.map(async ({ rawPassword, ...rest }) => ({
    ...rest,
    password: await bcrypt.hash(rawPassword, passwordHashRoundsExponent),
  }));

  const data = await Promise.all(dataPromises);

  await prisma.user.createMany({ data });

  return data;
};

const createTodos = async ([_admin, hoge, piyo]: Pick<User, "id">[]) => {
  const data = [
    {
      id: "01HFFZ0ABV8BJPJX50Z2PJ3DR9",
      title: "hoge todo 1",
      description: "hoge desc 1",
      userId: hoge.id,
    },
    {
      id: "01HFFZ0ABVVD5HPAARMZR74PHG",
      title: "piyo todo 1",
      description: "piyo desc 1",
      status: TodoStatus.DONE,
      userId: piyo.id,
    },
    {
      id: "01HFFZ0ABV43SDH3EGT46AM6P1",
      title: "piyo todo 2",
      description: "piyo desc 2",
      userId: piyo.id,
    },
  ];

  await prisma.todo.createMany({ data });
};

await main();
