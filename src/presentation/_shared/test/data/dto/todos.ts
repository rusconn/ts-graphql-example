import * as Dto from "../../../../../application/dto.ts";
import { db as todos } from "../db/todos.ts";

export const dto = {
  admin1: Dto.Todo.parseOrThrow(todos.admin1),
  alice1: Dto.Todo.parseOrThrow(todos.alice1),
  alice2: Dto.Todo.parseOrThrow(todos.alice2),
  alice3: Dto.Todo.parseOrThrow(todos.alice3),
};
