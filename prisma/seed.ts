import bcrypt from "bcrypt";
import { ulid } from "ulid";

import { passwordHashRoundsExponent } from "@/config.js";
import { type User, prisma, Role } from "@/prisma/mod.js";

const main = async () => {
  const users = await createUsers();
  await createTodos(users.map(({ id }) => id));
};

const createUsers = async () => {
  const rawParams = [
    {
      id: ulid(),
      name: "admin",
      email: "admin@admin.com",
      rawPassword: "adminadmin",
      token: ulid(),
      role: Role.ADMIN,
    },
    {
      id: ulid(),
      name: "hoge",
      email: "hoge@hoge.com",
      rawPassword: "hogehoge",
      token: ulid(),
      role: Role.USER,
    },
    {
      id: ulid(),
      name: "piyo",
      email: "piyo@piyo.com",
      rawPassword: "piyopiyo",
      token: ulid(),
      role: Role.USER,
    },
    {
      id: ulid(),
      name: "fuga",
      email: "fuga@fuga.com",
      rawPassword: "fugafuga",
      token: ulid(),
      role: Role.USER,
    },
  ];

  const paramPromises = rawParams.map(async ({ rawPassword, ...rest }) => ({
    ...rest,
    password: await bcrypt.hash(rawPassword, passwordHashRoundsExponent),
  }));

  const params = await Promise.all(paramPromises);

  const creates = params.map(data => prisma.user.create({ data }));

  return Promise.all(creates);
};

const createTodos = ([_adminId, userId1, userId2, _userId3]: User["id"][]) => {
  const params = [
    { id: ulid(), title: "hoge todo 1", description: "hoge desc 1", userId: userId1 },
    { id: ulid(), title: "piyo todo 1", description: "piyo desc 1", userId: userId2 },
    { id: ulid(), title: "piyo todo 2", description: "piyo desc 2", userId: userId2 },
  ];

  const creates = params.map(data => prisma.todo.create({ data }));

  return Promise.all(creates);
};

main().catch(console.error);
