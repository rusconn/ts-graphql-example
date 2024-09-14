import type { TodoSelect } from "@/db/models.ts";
import type * as Graph from "@/modules/common/schema.ts";
import { db } from "@/modules/common/testData/db/todo.ts";
import { todoNodeId, todoStatus } from "@/modules/todo/common/adapter.ts";

import { dateTime, dateTimeByUlid } from "./common.ts";

const node = (todo: TodoSelect): Graph.Todo => ({
  id: todoNodeId(todo.id),
  createdAt: dateTimeByUlid(todo.id),
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
