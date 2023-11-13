import type { MutationResolvers } from "../common/schema.js";
import * as completeTodo from "./Mutation.completeTodo.js";
import * as createTodo from "./Mutation.createTodo.js";
import * as deleteTodo from "./Mutation.deleteTodo.js";
import * as uncompleteTodo from "./Mutation.uncompleteTodo.js";
import * as updateTodo from "./Mutation.updateTodo.js";

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
