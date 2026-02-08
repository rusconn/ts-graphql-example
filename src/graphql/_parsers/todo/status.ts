import { Todo } from "../../../domain.ts";
import { TodoStatus } from "../../../schema.ts";

export const todoStatusMap = {
  [TodoStatus.Done]: Todo.Status.DONE,
  [TodoStatus.Pending]: Todo.Status.PENDING,
} as const;
