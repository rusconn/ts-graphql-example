import type { Resolvers } from "../../schema.ts";

import * as completeTodo from "./completeTodo.ts";
import * as createTodo from "./createTodo.ts";
import * as deleteAccount from "./deleteAccount.ts";
import * as deleteTodo from "./deleteTodo.ts";
import * as login from "./login.ts";
import * as logout from "./logout.ts";
import * as signup from "./signup.ts";
import * as uncompleteTodo from "./uncompleteTodo.ts";
import * as updateAccount from "./updateAccount.ts";
import * as updateTodo from "./updateTodo.ts";

const typeDef = /* GraphQL */ `
  type Mutation
`;

export const typeDefs = [
  typeDef,
  completeTodo.typeDef,
  createTodo.typeDef,
  deleteAccount.typeDef,
  deleteTodo.typeDef,
  login.typeDef,
  logout.typeDef,
  signup.typeDef,
  uncompleteTodo.typeDef,
  updateAccount.typeDef,
  updateTodo.typeDef,
];

export const resolvers: Resolvers["Mutation"] = {
  completeTodo: completeTodo.resolver,
  createTodo: createTodo.resolver,
  deleteAccount: deleteAccount.resolver,
  deleteTodo: deleteTodo.resolver,
  login: login.resolver,
  logout: logout.resolver,
  signup: signup.resolver,
  uncompleteTodo: uncompleteTodo.resolver,
  updateAccount: updateAccount.resolver,
  updateTodo: updateTodo.resolver,
};
