import type { OverrideProperties } from "type-fest";

import * as Domain from "../../../../../../domain/entities.ts";
import * as Graph from "../../../_types.ts";
import { todoId } from "../../../Todo/id.ts";
import { domain } from "../domain/todos.ts";
import { type DateTimeISO, dateTimeISO } from "./_shared.ts";

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
    createdAt: DateTimeISO;
    updatedAt: DateTimeISO;
  }
>;

const node = (todo: Domain.Todo.Type): GraphTodo => ({
  __typename: "Todo",
  id: todoId(todo.id),
  title: todo.title,
  description: todo.description,
  status: statusMap[todo.status],
  createdAt: dateTimeISO(todo.createdAt),
  updatedAt: dateTimeISO(todo.updatedAt),
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
