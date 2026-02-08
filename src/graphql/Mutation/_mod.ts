import type { MutationResolvers } from "../_schema.ts";
import * as accountDelete from "./accountDelete.ts";
import * as accountUpdate from "./accountUpdate.ts";
import * as login from "./login.ts";
import * as loginPasswordChange from "./loginPasswordChange.ts";
import * as logout from "./logout.ts";
import * as signup from "./signup.ts";
import * as todoCreate from "./todoCreate.ts";
import * as todoDelete from "./todoDelete.ts";
import * as todoStatusChange from "./todoStatusChange.ts";
import * as todoUpdate from "./todoUpdate.ts";
import * as tokenRefresh from "./tokenRefresh.ts";
import * as userEmailChange from "./userEmailChange.ts";

const typeDef = /* GraphQL */ `
  type Mutation
`;

export const typeDefs = [
  typeDef,
  accountDelete.typeDef,
  accountUpdate.typeDef,
  login.typeDef,
  loginPasswordChange.typeDef,
  logout.typeDef,
  signup.typeDef,
  todoCreate.typeDef,
  todoDelete.typeDef,
  todoStatusChange.typeDef,
  todoUpdate.typeDef,
  tokenRefresh.typeDef,
  userEmailChange.typeDef,
];

export const resolvers: MutationResolvers = {
  accountDelete: accountDelete.resolver,
  accountUpdate: accountUpdate.resolver,
  login: login.resolver,
  loginPasswordChange: loginPasswordChange.resolver,
  logout: logout.resolver,
  signup: signup.resolver,
  todoCreate: todoCreate.resolver,
  todoDelete: todoDelete.resolver,
  todoStatusChange: todoStatusChange.resolver,
  todoUpdate: todoUpdate.resolver,
  tokenRefresh: tokenRefresh.resolver,
  userEmailChange: userEmailChange.resolver,
};
