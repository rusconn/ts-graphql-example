import * as TodoId from "../../src/db/models/todo/id.ts";
import type { Todo } from "../../src/graphql/Todo/_mapper.ts";
import { todoId } from "../../src/graphql/_adapters/todo/id.ts";
import { todoStatus } from "../../src/graphql/_adapters/todo/status.ts";
import { db } from "../../src/graphql/_testData/db/todo.ts";
import type * as Graph from "../../src/schema.ts";

import { dateTime } from "./common.ts";

const node = (todo: Todo): Graph.Todo => ({
  id: todoId(todo.id),
  createdAt: dateTime(TodoId.date(todo.id)),
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

export const dummyId = () => todoId(TodoId.gen());
