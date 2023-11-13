import type { MutationResolvers } from "../common/schema.js";
import * as deleteMe from "./Mutation.deleteMe.js";
import * as login from "./Mutation.login.js";
import * as logout from "./Mutation.logout.js";
import * as signup from "./Mutation.signup.js";
import * as updateMe from "./Mutation.updateMe.js";

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
