import type * as Prisma from "@prisma/client";

import type * as Scalar from "./scalars";
import type * as Graph from "./schema";

// Date オブジェクトは自動で toISOString() される？ので許容する
type Timestamps = {
  createdAt: Date | Scalar.DateTime;
  updatedAt: Date | Scalar.DateTime;
};

export type User = Omit<Graph.User, "__typename" | "todos" | "createdAt" | "updatedAt"> &
  Timestamps;

export type Todo = Omit<Graph.Todo, "__typename" | "user" | "createdAt" | "updatedAt"> &
  Timestamps & {
    userId: Prisma.User["id"];
  };
