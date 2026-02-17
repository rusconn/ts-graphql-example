import type { QueryResolvers } from "./_schema.ts";
import * as node from "./Query/node.ts";
import * as user from "./Query/user.ts";
import * as users from "./Query/users.ts";
import * as viewer from "./Query/viewer.ts";

const typeDef = /* GraphQL */ `
  type Query
`;

export const typeDefs = [
  typeDef, //
  node.typeDef,
  user.typeDef,
  users.typeDef,
  viewer.typeDef,
];

export const resolvers: QueryResolvers = {
  node: node.resolver,
  user: user.resolver,
  users: users.resolver,
  viewer: viewer.resolver,
};
