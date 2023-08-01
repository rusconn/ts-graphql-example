import type * as DataSource from "@/datasources";

export type Todo = Pick<DataSource.Todo, "id" | "userId">;
export type User = Pick<DataSource.User, "id">;
