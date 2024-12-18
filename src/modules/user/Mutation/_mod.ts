import type { MutationResolvers } from "../../../schema.ts";
import * as deleteMe from "./deleteAccount.ts";
import * as updateMe from "./editUserProfile.ts";
import * as login from "./login.ts";
import * as logout from "./logout.ts";
import * as signup from "./signup.ts";

const typeDef = /* GraphQL */ `
  type UserNameAlreadyTakenError implements Error {
    message: String!
  }
  type UserEmailAlreadyTakenError implements Error {
    message: String!
  }
`;

export const typeDefs = [
  typeDef,
  deleteMe.typeDef,
  login.typeDef,
  logout.typeDef,
  signup.typeDef,
  updateMe.typeDef,
];

export const resolvers: MutationResolvers = {
  deleteMe: deleteMe.resolver,
  login: login.resolver,
  logout: logout.resolver,
  signup: signup.resolver,
  updateMe: updateMe.resolver,
};
