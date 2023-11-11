import type { UserResolvers } from "../common/schema";
import * as todo from "./User.todo";
import * as todos from "./User.todos";

export const typeDefs = [todo.typeDef, todos.typeDef];

export const resolvers: UserResolvers = {
  todo: todo.resolver,
  todos: todos.resolver,
};
