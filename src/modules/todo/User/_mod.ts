import type { UserResolvers } from "../../common/schema.ts";
import * as todo from "./todo.ts";
import * as todos from "./todos.ts";

export const typeDefs = [todo.typeDef, todos.typeDef];

export const resolvers: UserResolvers = {
  todo: todo.resolver,
  todos: todos.resolver,
};
