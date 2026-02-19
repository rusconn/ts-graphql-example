import * as TodoRepo from "../../../../../../infrastructure/unit-of-works/db/_shared/todo.ts";
import { db as todos } from "../db/todos.ts";

export const domain = {
  admin1: TodoRepo.toDomain(todos.admin1),
  alice1: TodoRepo.toDomain(todos.alice1),
  alice2: TodoRepo.toDomain(todos.alice2),
  alice3: TodoRepo.toDomain(todos.alice3),
};
