// kysely-codegenが生成しないので手で追加した

import type { Insertable, Selectable, Updateable } from "kysely";

import type * as Genned from "./generated.ts";

export type { DB, Todostatus as TodoStatus, Userrole as UserRole } from "./generated.ts";

export type Todo = Selectable<Genned.Todo>;
export type NewTodo = Insertable<Genned.Todo>;
export type TodoUpdate = Updateable<Genned.Todo>;

export type User = Selectable<Genned.User>;
export type NewUser = Insertable<Genned.User>;
export type UserUpdate = Updateable<Genned.User>;

export type UserCredential = Selectable<Genned.UserCredential>;
export type NewUserCredential = Insertable<Genned.UserCredential>;
export type UserCredentialUpdate = Updateable<Genned.UserCredential>;

export type UserToken = Selectable<Genned.UserToken>;
export type NewUserToken = Insertable<Genned.UserToken>;
export type UserTokenUpdate = Updateable<Genned.UserToken>;
