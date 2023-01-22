import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

import { passwordHashRoundsExponent } from "@/config";
import { prisma, Role, User } from "@/datasources";

const main = async () => {
  const users = await createUsers();
  await createTodos(users.map(({ id }) => id));
};

const createUsers = async () => {
  const rawParams = [
    {
      id: nanoid(),
      name: "admin",
      email: "admin@admin.com",
      rawPassword: "adminadmin",
      token: nanoid(),
      role: Role.ADMIN,
    },
    {
      id: nanoid(),
      name: "hoge",
      email: "hoge@hoge.com",
      rawPassword: "hogehoge",
      token: nanoid(),
      role: Role.USER,
    },
    {
      id: nanoid(),
      name: "piyo",
      email: "piyo@piyo.com",
      rawPassword: "piyopiyo",
      token: nanoid(),
      role: Role.USER,
    },
    {
      id: nanoid(),
      name: "fuga",
      email: "fuga@fuga.com",
      rawPassword: "fugafuga",
      token: nanoid(),
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
    { id: nanoid(), title: "hoge todo 1", description: "hoge desc 1", userId: userId1 },
    { id: nanoid(), title: "piyo todo 1", description: "piyo desc 1", userId: userId2 },
    { id: nanoid(), title: "piyo todo 2", description: "piyo desc 2", userId: userId2 },
  ];

  const creates = params.map(data => prisma.todo.create({ data }));

  return Promise.all(creates);
};

main().catch(console.error);
