// kysely-codegenが生成しないので手で追加した

import type { Insertable, Selectable, Updateable } from "kysely";

import type * as Genned from "./generated.ts";

export type { DB } from "./generated.ts";

export const TodoStatus = {
  Done: "done",
  Pending: "pending",
} satisfies Record<string, Genned.TodoStatus>;
export type TodoStatus = Genned.TodoStatus;

export const UserRole = {
  Admin: "admin",
  User: "user",
} satisfies Record<string, Genned.UserRole>;
export type UserRole = Genned.UserRole;

export type Todo = Selectable<Genned.Todos>;
export type NewTodo = Insertable<Genned.Todos>;
export type TodoUpdate = Updateable<Genned.Todos>;

export type User = Selectable<Genned.Users>;
export type NewUser = Insertable<Genned.Users>;
export type UserUpdate = Updateable<Genned.Users>;

export type Credential = Selectable<Genned.Credentials>;
export type NewCredential = Insertable<Genned.Credentials>;
export type CredentialUpdate = Updateable<Genned.Credentials>;

export type RefreshToken = Selectable<Genned.RefreshTokens>;
export type NewRefreshToken = Insertable<Genned.RefreshTokens>;
export type RefreshTokenUpdate = Updateable<Genned.RefreshTokens>;
