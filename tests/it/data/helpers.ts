import type * as DataSource from "@/datasources";
import { adapters as todoAdapters } from "@/graphql/adapters/todo";
import { adapters as userAdapters } from "@/graphql/adapters/user";
import type { Graph } from "@/graphql/types";

export const toTodoNode = (todo: DataSource.Todo): Graph.Todo => ({
  id: todoAdapters.Todo.id(todo.id),
  createdAt: todoAdapters.Todo.createdAt(todo.createdAt),
  updatedAt: todoAdapters.Todo.updatedAt(todo.updatedAt),
  title: todoAdapters.Todo.title(todo.title),
  description: todoAdapters.Todo.description(todo.description),
  status: todoAdapters.Todo.status(todo.status),
});

export const toUserNode = (user: DataSource.User): Graph.User => ({
  id: userAdapters.User.id(user.id),
  createdAt: userAdapters.User.createdAt(user.createdAt),
  updatedAt: userAdapters.User.updatedAt(user.updatedAt),
  name: userAdapters.User.name(user.name),
  email: userAdapters.User.email(user.email),
  token: userAdapters.User.token(user.token),
});
