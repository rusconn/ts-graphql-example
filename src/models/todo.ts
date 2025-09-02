import type { Except, OverrideProperties } from "type-fest";

import type { NewTodo, Todo as TodoSelect } from "../db/types.ts";
import type { TodoId } from "./todo/id.ts";
import type { UserId } from "./user/id.ts";

export type TodoKey = {
  id: TodoId;
  userId?: UserId;
};

export type Todo = OverrideProperties<
  TodoSelect,
  {
    id: TodoId;
    userId: UserId;
  }
>;

export type TodoNew = OverrideProperties<
  Except<NewTodo, "id" | "updatedAt">,
  {
    userId: UserId;
  }
>;

export type TodoUpd = Partial<TodoNew>;
