import type { ColumnType, Insertable, Selectable, Updateable } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const TodoStatus = {
    DONE: "DONE",
    PENDING: "PENDING"
} as const;
export type TodoStatus = (typeof TodoStatus)[keyof typeof TodoStatus];
export const UserRole = {
    ADMIN: "ADMIN",
    USER: "USER"
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export type TodoTable = {
    id: string;
    updatedAt: Timestamp;
    title: string;
    description: Generated<string>;
    status: Generated<TodoStatus>;
    userId: string;
};
export type Todo = Selectable<TodoTable>;
export type NewTodo = Insertable<TodoTable>;
export type TodoUpdate = Updateable<TodoTable>;
export type UserTable = {
    id: string;
    updatedAt: Timestamp;
    name: string;
    email: string;
    role: Generated<UserRole>;
};
export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;
export type UserCredentialTable = {
    userId: string;
    updatedAt: Timestamp;
    password: string;
};
export type UserCredential = Selectable<UserCredentialTable>;
export type NewUserCredential = Insertable<UserCredentialTable>;
export type UserCredentialUpdate = Updateable<UserCredentialTable>;
export type UserTokenTable = {
    userId: string;
    updatedAt: Timestamp;
    token: string;
};
export type UserToken = Selectable<UserTokenTable>;
export type NewUserToken = Insertable<UserTokenTable>;
export type UserTokenUpdate = Updateable<UserTokenTable>;
export type DB = {
    Todo: TodoTable;
    User: UserTable;
    UserCredential: UserCredentialTable;
    UserToken: UserTokenTable;
};
