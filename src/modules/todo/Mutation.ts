import type { MutationResolvers } from "../common/schema.ts";
import * as completeTodo from "./Mutation.completeTodo.ts";
import * as createTodo from "./Mutation.createTodo.ts";
import * as deleteTodo from "./Mutation.deleteTodo.ts";
import * as uncompleteTodo from "./Mutation.uncompleteTodo.ts";
import * as updateTodo from "./Mutation.updateTodo.ts";

const typeDef = /* GraphQL */ `
  type TodoNotFoundError implements Error {
    message: String!
  }
`;

export const typeDefs = [
  typeDef,
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
