import type { MutationResolvers } from "../../../schema.ts";
import * as deleteMe from "./deleteMe.ts";
import * as login from "./login.ts";
import * as logout from "./logout.ts";
import * as signup from "./signup.ts";
import * as updateMe from "./updateMe.ts";

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
