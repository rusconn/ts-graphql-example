import type * as Prisma from "@/prisma/mod.js";
import type * as Graph from "@/modules/common/schema.js";
import type { DateTime } from "@/modules/scalar/mod.js";
import * as todoId from "@/modules/todo/Todo.id.js";
import * as todoStatus from "@/modules/todo/Todo.status.js";
import * as userId from "@/modules/user/User.id.js";

export const todoNode = (todo: Prisma.Todo): DateTimed<Graph.Todo> => ({
  id: todoId.adapter(todo.id),
  createdAt: todo.createdAt.toISOString() as DateTime,
  updatedAt: todo.updatedAt.toISOString() as DateTime,
  title: todo.title,
  description: todo.description,
  status: todoStatus.adapter(todo.status),
});

export const userNode = (user: Prisma.User): DateTimed<Graph.User> => ({
  id: userId.adapter(user.id),
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
