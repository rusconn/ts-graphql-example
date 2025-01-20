import * as internalId from "../../src/db/models/todo/id.ts";
import { db } from "../../src/modules/common/testData/db/todo.ts";
import type { Todo } from "../../src/modules/todo/Todo/_mapper.ts";
import { todoId } from "../../src/modules/todo/adapters/id.ts";
import { todoStatus } from "../../src/modules/todo/adapters/status.ts";
import type * as Graph from "../../src/schema.ts";

import { dateTime } from "./common.ts";

const node = (todo: Todo): Graph.Todo => ({
  id: todoId(todo.id),
  createdAt: dateTime(internalId.date(todo.id)),
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

export const dummyId = () => todoId(internalId.gen());
