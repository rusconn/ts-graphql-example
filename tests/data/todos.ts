import type * as Db from "../../src/db/types.ts";
import { TodoId } from "../../src/domain/todo.ts";
import { todoId } from "../../src/graphql/_adapters/todo/id.ts";
import { todoStatus } from "../../src/graphql/_adapters/todo/status.ts";
import { db } from "../../src/graphql/_testData/db/todos.ts";
import type * as Graph from "../../src/schema.ts";

const node = (todo: Db.Todo): Graph.Todo => ({
  ...todo,
  id: todoId(todo.id),
  status: todoStatus(todo.status),
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
