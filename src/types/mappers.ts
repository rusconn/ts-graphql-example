import type { DateTime } from "@/utils";

import type * as Graph from "./graphql";

// Date オブジェクトは自動で toISOString() される？ので許容する
type Timestamps = {
  createdAt: Date | DateTime;
  updatedAt: Date | DateTime;
};

export type User = Omit<Graph.User, "__typename" | "todos" | "createdAt" | "updatedAt"> &
  Timestamps;

export type Todo = Omit<Graph.Todo, "__typename" | "user" | "createdAt" | "updatedAt"> &
  Timestamps & {
    userId: User["id"];
  };
