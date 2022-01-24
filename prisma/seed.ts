import zipWith from "lodash/zipWith";
import { User, Role } from "@prisma/client";

import { makePrismaClient } from "@/utils";

const prisma = makePrismaClient(true);

const main = async () => {
  const users = await createUsers();
  await createTodos(users.map(({ id }) => id));
};

const createUsers = () => {
  const names = ["admin", "hoge", "piyo", "fuga"];
  const roles = [Role.ADMIN, Role.USER, Role.USER, Role.USER];
  const users = zipWith(names, roles, (name, role) => ({ name, role }));
  const creates = users.map(data => prisma.user.create({ data }));
  return Promise.all(creates);
};

const createTodos = ([_adminId, userId1, userId2, _userId3]: User["id"][]) => {
  const todo1 = ["hoge todo 1", "hoge desc 1", userId1] as const;
  const todo2 = ["piyo todo 1", "piyo desc 1", userId2] as const;
  const todo3 = ["piyo todo 2", "piyo desc 2", userId2] as const;

  const todos = [todo1, todo2, todo3].map(([title, description, userId]) => ({
    title,
    description,
    userId,
  }));

  const creates = todos.map(data => prisma.todo.create({ data }));
  return Promise.all(creates);
};

main().catch(console.error);
