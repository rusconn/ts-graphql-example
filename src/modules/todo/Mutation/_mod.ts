import type { MutationResolvers } from "../../../schema.ts";
import * as completeTodo from "./completeTodo.ts";
import * as createTodo from "./createTodo.ts";
import * as deleteTodo from "./deleteTodo.ts";
import * as uncompleteTodo from "./uncompleteTodo.ts";
import * as updateTodo from "./updateTodo.ts";

export const typeDefs = [
  completeTodo.typeDef,
  createTodo.typeDef,
  deleteTodo.typeDef,
  uncompleteTodo.typeDef,
  updateTodo.typeDef,
];

export const resolvers: MutationResolvers = {
  completeTodo: completeTodo.resolver,
  createTodo: createTodo.resolver,
  deleteTodo: deleteTodo.resolver,
  uncompleteTodo: uncompleteTodo.resolver,
  updateTodo: updateTodo.resolver,
};
