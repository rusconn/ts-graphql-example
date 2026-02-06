import type * as Domain from "../../src/domain/todo.ts";
import { TodoId } from "../../src/domain/todo.ts";
import { todoId } from "../../src/graphql/_adapters/todo/id.ts";
import { db } from "../../src/graphql/_testData/db/todos.ts";
import { domain } from "../../src/graphql/_testData/domain/todos.ts";
import type * as Graph from "../../src/schema.ts";

const node = (todo: Domain.Todo): Graph.Todo => ({
  ...todo,
  id: todoId(todo.id),
});

export const graph = {
  admin1: node(domain.admin1),
  admin2: node(domain.admin2),
  admin3: node(domain.admin3),
  alice1: node(domain.alice1),
};

export { db, domain };

export const dummyId = () => {
  return todoId(TodoId.gen());
};
