import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const TodoStatus = {
  DONE: "DONE",
  PENDING: "PENDING",
} as const;
export type TodoStatus = typeof TodoStatus[keyof typeof TodoStatus];
export const UserRole = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];
export type Todo = {
  id: string;
  updatedAt: Timestamp;
  title: string;
  description: Generated<string>;
  status: Generated<TodoStatus>;
  userId: string;
};
export type User = {
  id: string;
  updatedAt: Timestamp;
  name: string;
  email: string;
  password: string;
  token: string | null;
  role: Generated<UserRole>;
};
export type DB = {
  Todo: Todo;
  User: User;
};
