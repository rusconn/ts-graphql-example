import type { TodoSelect } from "../../src/db/models.ts";
import { db } from "../../src/modules/common/testData/db/todo.ts";
import { todoNodeId, todoStatus } from "../../src/modules/todo/common/adapter.ts";
import type * as Graph from "../../src/schema.ts";

import { dateTime, dateTimeByUuid, dummySomeNodeId } from "./common.ts";

const node = (todo: TodoSelect): Graph.Todo => ({
  id: todoNodeId(todo.id),
  createdAt: dateTimeByUuid(todo.id),
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

export const dummyNodeId = dummySomeNodeId(todoNodeId);
