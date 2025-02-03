import type { OverrideProperties } from "type-fest";

import type { NonEmptyString } from "../../lib/string/nonEmptyString.ts";
import type { TodoInsert, TodoSelect, TodoUpdate } from "../generated/types-extension.ts";
import type { TodoId } from "./todo/id.ts";
import type { UserId } from "./user/id.ts";

export type TodoKey = {
  id: Todo["id"];
  userId?: Todo["userId"];
};

export type Todo = OverrideProperties<
  TodoSelect,
  {
    id: TodoId;
    title: NonEmptyString;
    userId: UserId;
  }
>;

export type NewTodo = OverrideProperties<
  TodoInsert,
  {
    id: TodoId;
    title: NonEmptyString;
    userId: UserId;
  }
>;

export type UpdTodo = OverrideProperties<
  TodoUpdate,
  {
    id?: TodoId;
    title?: NonEmptyString;
    userId?: UserId;
  }
>;
