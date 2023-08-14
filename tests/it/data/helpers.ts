import type * as DataSource from "@/datasources";
import { adapters as todoAdapters } from "@/modules/todo/adapters";
import { adapters as userAdapters } from "@/modules/user/adapters";
import type * as Graph from "@/modules/common/schema";

export const toTodoNode = (todo: DataSource.Todo): Graph.Todo => ({
  id: todoAdapters.Todo.id(todo.id),
  createdAt: todo.createdAt,
  updatedAt: todo.updatedAt,
  title: todo.title,
  description: todo.description,
  status: todoAdapters.Todo.status(todo.status),
});

export const toUserNode = (user: DataSource.User): Graph.User => ({
  id: userAdapters.User.id(user.id),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  name: user.name,
  email: user.email,
  token: user.token,
});
