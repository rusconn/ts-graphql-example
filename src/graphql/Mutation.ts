import type { MutationResolvers } from "./_schema.ts";
import * as accountDelete from "./Mutation/accountDelete.ts";
import * as accountUpdate from "./Mutation/accountUpdate.ts";
import * as login from "./Mutation/login.ts";
import * as loginPasswordChange from "./Mutation/loginPasswordChange.ts";
import * as logout from "./Mutation/logout.ts";
import * as signup from "./Mutation/signup.ts";
import * as todoCreate from "./Mutation/todoCreate.ts";
import * as todoDelete from "./Mutation/todoDelete.ts";
import * as todoStatusChange from "./Mutation/todoStatusChange.ts";
import * as todoUpdate from "./Mutation/todoUpdate.ts";
import * as tokenRefresh from "./Mutation/tokenRefresh.ts";
import * as userEmailChange from "./Mutation/userEmailChange.ts";

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
