import type { Todo } from "../../../../infrastructure/datasources/db/types.ts";

export type Key = Pick<Todo, "id" | "userId">;
