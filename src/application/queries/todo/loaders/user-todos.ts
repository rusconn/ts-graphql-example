import type { Todo, TodoStatus } from "../../../../infra/datasources/_shared/types.ts";

export type Key = {
  userId: Todo["userId"];
  sortKey: "createdAt" | "updatedAt";
  reverse: boolean;
  cursor?: Todo["id"];
  limit: number;
  status?: TodoStatus;
};
