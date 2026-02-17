import type { OverrideProperties } from "type-fest";

import * as Domain from "../../../../domain/entities.ts";
import * as Graph from "../../../../graphql/_schema.ts";
import { todoId } from "../../../../graphql/Todo/id.ts";
import { domain } from "../domain/todos.ts";
import { type DateTime, dateTime } from "./_shared.ts";

type GraphTodo = OverrideProperties<
  Required<
    Pick<
      Graph.Todo,
      | "__typename" //
      | "id"
      | "title"
      | "description"
      | "status"
      | "createdAt"
      | "updatedAt"
    >
  >,
  {
    createdAt: DateTime;
    updatedAt: DateTime;
  }
>;

const node = (todo: Domain.Todo.Type): GraphTodo => ({
  __typename: "Todo",
  id: todoId(todo.id),
  title: todo.title,
  description: todo.description,
  status: statusMap[todo.status],
  createdAt: dateTime(todo.createdAt),
  updatedAt: dateTime(todo.updatedAt),
});

const statusMap: Record<Domain.Todo.Status.Type, GraphTodo["status"]> = {
  [Domain.Todo.Status.DONE]: Graph.TodoStatus.Done,
  [Domain.Todo.Status.PENDING]: Graph.TodoStatus.Pending,
};

export const graph = {
  admin1: node(domain.admin1),
  alice1: node(domain.alice1),
  alice2: node(domain.alice2),
  alice3: node(domain.alice3),
};

export const dummyId = () => {
  return todoId(Domain.Todo.Id.create());
};
