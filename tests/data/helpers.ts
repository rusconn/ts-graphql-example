import type * as Prisma from "@/prisma/mod.ts";
import type * as Graph from "@/modules/common/schema.ts";
import type { DateTime } from "@/modules/scalar/mod.ts";
import { todoNodeId, todoStatus } from "@/modules/todo/common/adapter.ts";
import { userNodeId } from "@/modules/user/common/adapter.ts";

export const todoNode = (todo: Prisma.Todo): Graph.Todo => ({
  id: todoNodeId(todo.id),
  createdAt: dateTime(todo.createdAt),
  updatedAt: dateTime(todo.updatedAt),
  title: todo.title,
  description: todo.description,
  status: todoStatus(todo.status),
});

export const userNode = (user: Prisma.User): Graph.User => ({
  id: userNodeId(user.id),
  createdAt: dateTime(user.createdAt),
  updatedAt: dateTime(user.updatedAt),
  name: user.name,
  email: user.email,
  token: user.token,
});

// DateTime リゾルバーによる変換のシミュレーション
const dateTime = (date: Date) => date.toISOString() as DateTime;
