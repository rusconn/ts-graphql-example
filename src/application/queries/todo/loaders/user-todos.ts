import type { Todo, TodoStatus } from "../../../../infrastructure/datasources/db/types.ts";

export type Key = {
  userId: Todo["userId"];
  sortKey: "createdAt" | "updatedAt";
  reverse: boolean;
  cursor?: Todo["id"];
  limit: number;
  status?: TodoStatus;
  search?: string;
};
