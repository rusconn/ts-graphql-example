import type { UserResolvers } from "../common/schema.js";
import * as todo from "./User.todo.js";
import * as todos from "./User.todos.js";

export const typeDefs = [todo.typeDef, todos.typeDef];

export const resolvers: UserResolvers = {
  todo: todo.resolver,
  todos: todos.resolver,
};
