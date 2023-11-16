import type { MutationResolvers } from "../common/schema.ts";
import * as deleteMe from "./Mutation.deleteMe.ts";
import * as login from "./Mutation.login.ts";
import * as logout from "./Mutation.logout.ts";
import * as signup from "./Mutation.signup.ts";
import * as updateMe from "./Mutation.updateMe.ts";

const typeDef = /* GraphQL */ `
  type EmailAlreadyTakenError implements Error {
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
