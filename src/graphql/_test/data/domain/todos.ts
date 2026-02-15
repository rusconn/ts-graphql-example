import * as TodoRepo from "../../../../infra/unit-of-works/db/_shared/todo.ts";
import { db as todos } from "../db/todos.ts";

export const domain = {
  admin1: TodoRepo.toDomain(todos.admin1),
  admin2: TodoRepo.toDomain(todos.admin2),
  admin3: TodoRepo.toDomain(todos.admin3),
  alice1: TodoRepo.toDomain(todos.alice1),
};
