import { nanoid } from "nanoid";

import { prisma, Role, User } from "@/datasources";

const main = async () => {
  const users = await createUsers();
  await createTodos(users.map(({ id }) => id));
};

const createUsers = () => {
  const params = [
    { id: nanoid(), name: "admin", token: nanoid(), role: Role.ADMIN },
    { id: nanoid(), name: "hoge", token: nanoid(), role: Role.USER },
    { id: nanoid(), name: "piyo", token: nanoid(), role: Role.USER },
    { id: nanoid(), name: "fuga", token: nanoid(), role: Role.USER },
  ];

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
