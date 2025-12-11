import type * as Domain from "../../../domain/todo.ts";
import { mappers } from "../../../mappers.ts";
import { db as todos } from "../db/todos.ts";

export const domain = {
  admin1: mappers.todo.toDomain(todos.admin1),
  admin2: mappers.todo.toDomain(todos.admin2),
  admin3: mappers.todo.toDomain(todos.admin3),
  alice1: mappers.todo.toDomain(todos.alice1),
} satisfies Record<string, Domain.Todo>;
