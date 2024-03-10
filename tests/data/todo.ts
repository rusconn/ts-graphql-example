import type * as DB from "@/db/mod.ts";
import type * as Graph from "@/modules/common/schema.ts";
import { todoNodeId, todoStatus } from "@/modules/todo/common/adapter.ts";
import { db } from "@/modules/todo/common/test.ts";

import { dateTime } from "./common.ts";

const node = (todo: DB.TodoSelect): Graph.Todo => ({
  id: todoNodeId(todo.id),
  createdAt: dateTime(todo.createdAt),
  updatedAt: dateTime(todo.updatedAt),
  title: todo.title,
  description: todo.description,
  status: todoStatus(todo.status),
});

export const graph = {
  adminTodo: node(db.adminTodo),
  adminTodo2: node(db.adminTodo2),
  adminTodo3: node(db.adminTodo3),
  aliceTodo: node(db.aliceTodo),
};

export { db };
