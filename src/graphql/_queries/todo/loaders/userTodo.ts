import type { Todo } from "../../../../infra/datasources/_shared/types.ts";

export type Key = Pick<Todo, "id" | "userId">;
