import type { Todo, TodoStatus } from "../../../../infra/datasources/_shared/types.ts";

export type Key = {
  userId: Todo["userId"];
  status?: TodoStatus;
};
