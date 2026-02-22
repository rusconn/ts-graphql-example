import type { Todo, TodoStatus } from "../../../../infrastructure/datasources/_shared/types.ts";

export type Key = {
  userId: Todo["userId"];
  status?: TodoStatus;
};
