import type { Todo, TodoStatus } from "../../../../infrastructure/datasources/db/types.ts";

export type Key = {
  userId: Todo["userId"];
  status?: TodoStatus;
  search?: string;
};
