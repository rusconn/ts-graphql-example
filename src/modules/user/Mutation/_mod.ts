import type { MutationResolvers } from "../../../schema.ts";
import * as deleteAccount from "./deleteAccount.ts";
import * as login from "./login.ts";
import * as logout from "./logout.ts";
import * as signup from "./signup.ts";
import * as updateAccount from "./updateAccount.ts";

const typeDef = /* GraphQL */ `
  type EmailAlreadyTakenError implements Error {
    message: String!
  }
`;

export const typeDefs = [
  typeDef,
  deleteAccount.typeDef,
  login.typeDef,
  logout.typeDef,
  signup.typeDef,
  updateAccount.typeDef,
];

export const resolvers: MutationResolvers = {
  deleteAccount: deleteAccount.resolver,
  login: login.resolver,
  logout: logout.resolver,
  signup: signup.resolver,
  updateAccount: updateAccount.resolver,
};
