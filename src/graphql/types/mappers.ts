import type * as Prisma from "@prisma/client";

import type * as Scalar from "./scalars";
import type * as Graph from "./schema";

// Date オブジェクトは自動で toISOString() される？ので許容する
type WideTimestamps<T> = Omit<T, "createdAt" | "updatedAt"> & {
  createdAt: Date | Scalar.DateTime;
  updatedAt: Date | Scalar.DateTime;
};

export type User = WideTimestamps<Omit<Graph.User, "__typename" | "todos">>;

export type Todo = WideTimestamps<Omit<Graph.Todo, "__typename" | "user">> & {
  userId: Prisma.User["id"];
};
