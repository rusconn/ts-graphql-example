import type { Resolvers } from "../../schema.ts";
import * as accountDelete from "./accountDelete.ts";
import * as accountUpdate from "./accountUpdate.ts";
import * as login from "./login.ts";
import * as logout from "./logout.ts";
import * as signup from "./signup.ts";
import * as todoCreate from "./todoCreate.ts";
import * as todoDelete from "./todoDelete.ts";
import * as todoStatusChange from "./todoStatusChange.ts";
import * as todoUpdate from "./todoUpdate.ts";

const typeDef = /* GraphQL */ `
  type Mutation
`;

export const typeDefs = [
  typeDef,
  accountDelete.typeDef,
  accountUpdate.typeDef,
  login.typeDef,
  logout.typeDef,
  signup.typeDef,
  todoCreate.typeDef,
  todoDelete.typeDef,
  todoStatusChange.typeDef,
  todoUpdate.typeDef,
];

export const resolvers: Resolvers["Mutation"] = {
  accountDelete: accountDelete.resolver,
  accountUpdate: accountUpdate.resolver,
  login: login.resolver,
  logout: logout.resolver,
  signup: signup.resolver,
  todoCreate: todoCreate.resolver,
  todoDelete: todoDelete.resolver,
  todoStatusChange: todoStatusChange.resolver,
  todoUpdate: todoUpdate.resolver,
};
