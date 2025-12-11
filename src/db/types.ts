// kysely-codegenが生成しないので手で追加した

import type { Insertable, Selectable, Updateable } from "kysely";

import type * as Genned from "./generated.ts";

export type { DB, TodoStatus, UserRole } from "./generated.ts";

export type Todo = Selectable<Genned.Todos>;
export type NewTodo = Insertable<Genned.Todos>;
export type TodoUpdate = Updateable<Genned.Todos>;

export type User = Selectable<Genned.Users>;
export type NewUser = Insertable<Genned.Users>;
export type UserUpdate = Updateable<Genned.Users>;

export type UserCredential = Selectable<Genned.UserCredentials>;
export type NewUserCredential = Insertable<Genned.UserCredentials>;
export type UserCredentialUpdate = Updateable<Genned.UserCredentials>;

export type UserToken = Selectable<Genned.UserTokens>;
export type NewUserToken = Insertable<Genned.UserTokens>;
export type UserTokenUpdate = Updateable<Genned.UserTokens>;
