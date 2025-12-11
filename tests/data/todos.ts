import { todoId } from "../../src/graphql/_adapters/todo/id.ts";
import { db } from "../../src/graphql/_testData/db/todos.ts";
import type { Todo } from "../../src/models/todo.ts";
import { TodoId } from "../../src/models/todo.ts";
import type * as Graph from "../../src/schema.ts";

import { dateTime } from "./common.ts";

const node = (todo: Todo): Graph.Todo => ({
  ...todo,
  id: todoId(todo.id),
  createdAt: dateTime(TodoId.date(todo.id)),
  updatedAt: dateTime(todo.updatedAt),
});

export const graph = {
  admin1: node(db.admin1),
  admin2: node(db.admin2),
  admin3: node(db.admin3),
  alice1: node(db.alice1),
};

export { db };

export const dummyId = () => {
  return todoId(TodoId.gen());
};
