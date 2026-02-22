import type { Todo } from "../../../../infrastructure/datasources/_shared/types.ts";

export type Key = Pick<Todo, "id" | "userId">;
