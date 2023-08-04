import type * as DataSource from "@/datasources";

export type Todo = DataSource.Todo;
export type User = Omit<DataSource.User, "password" | "role">;
