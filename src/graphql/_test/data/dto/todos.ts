import * as Dto from "../../../../application/queries/dto.ts";
import { db as todos } from "../db/todos.ts";

export const dto = {
  admin1: Dto.Todo.parseOrThrow(todos.admin1),
  admin2: Dto.Todo.parseOrThrow(todos.admin2),
  admin3: Dto.Todo.parseOrThrow(todos.admin3),
  alice1: Dto.Todo.parseOrThrow(todos.alice1),
};
