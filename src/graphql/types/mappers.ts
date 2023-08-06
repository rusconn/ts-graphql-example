import type * as DataSource from "@/datasources";

type WithSelect<T, U extends DataSource.SelectScalar> = T & { select?: U };

type TodoKeys = Pick<DataSource.Todo, "id"> & Partial<Pick<DataSource.Todo, "userId">>;
type UserKeys = Pick<DataSource.User, "id">;

export type Todo = WithSelect<TodoKeys, DataSource.TodoSelectScalar>;
export type User = WithSelect<UserKeys, DataSource.UserSelectScalar>;
