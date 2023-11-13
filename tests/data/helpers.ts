import type * as Prisma from "@/prisma/mod.js";
import type * as Graph from "@/modules/common/schema.js";
import type { DateTime } from "@/modules/scalar/mod.js";
import { todoNodeId, todoStatus } from "@/modules/todo/common/adapter.js";
import { userNodeId } from "@/modules/user/common/adapter.js";

export const todoNode = (todo: Prisma.Todo): DateTimed<Graph.Todo> => ({
  id: todoNodeId(todo.id),
  createdAt: todo.createdAt.toISOString() as DateTime,
  updatedAt: todo.updatedAt.toISOString() as DateTime,
  title: todo.title,
  description: todo.description,
  status: todoStatus(todo.status),
});

export const userNode = (user: Prisma.User): DateTimed<Graph.User> => ({
  id: userNodeId(user.id),
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
