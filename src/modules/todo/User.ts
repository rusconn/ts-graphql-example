import type { UserResolvers } from "../common/schema.ts";
import * as todo from "./User.todo.ts";
import * as todos from "./User.todos.ts";

export const typeDefs = [todo.typeDef, todos.typeDef];

export const resolvers: UserResolvers = {
  todo: todo.resolver,
  todos: todos.resolver,
};
