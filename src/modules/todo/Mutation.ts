import type { MutationResolvers } from "../common/schema";
import * as completeTodo from "./Mutation.completeTodo";
import * as createTodo from "./Mutation.createTodo";
import * as deleteTodo from "./Mutation.deleteTodo";
import * as uncompleteTodo from "./Mutation.uncompleteTodo";
import * as updateTodo from "./Mutation.updateTodo";

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
