import type { Resolvers } from "../../schema.ts";

import * as node from "./node.ts";
import * as user from "./user.ts";
import * as users from "./users.ts";
import * as viewer from "./viewer.ts";

const typeDef = /* GraphQL */ `
  type Query
`;

export const typeDefs = [
  //
  typeDef,
  node.typeDef,
  user.typeDef,
  users.typeDef,
  viewer.typeDef,
];

export const resolvers: Resolvers["Query"] = {
  node: node.resolver,
  user: user.resolver,
  users: users.resolver,
  viewer: viewer.resolver,
};
