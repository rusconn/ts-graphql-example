import type * as Prisma from "@/prisma";
import type * as Graph from "@/modules/common/schema";
import type { DateTime } from "@/modules/scalar/parsers";
import { adapters as todoAdapters } from "@/modules/todo/adapters";
import { adapters as userAdapters } from "@/modules/user/adapters";

export const todoNode = (todo: Prisma.Todo): DateTimed<Graph.Todo> => ({
  id: todoAdapters.Todo.id(todo.id),
  createdAt: todo.createdAt.toISOString() as DateTime,
  updatedAt: todo.updatedAt.toISOString() as DateTime,
  title: todo.title,
  description: todo.description,
  status: todoAdapters.Todo.status(todo.status),
});

export const userNode = (user: Prisma.User): DateTimed<Graph.User> => ({
  id: userAdapters.User.id(user.id),
  createdAt: user.createdAt.toISOString() as DateTime,
  updatedAt: user.updatedAt.toISOString() as DateTime,
  name: user.name,
  email: user.email,
  token: user.token,
});

// DateTime リゾルバーによる変換のシミュレーション
type DateTimed<T> = T & {
  createdAt: DateTime;
  updatedAt: DateTime;
};
