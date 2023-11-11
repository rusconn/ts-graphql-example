import type { MutationResolvers } from "../common/schema";
import * as deleteMe from "./Mutation.deleteMe";
import * as login from "./Mutation.login";
import * as logout from "./Mutation.logout";
import * as signup from "./Mutation.signup";
import * as updateMe from "./Mutation.updateMe";

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
