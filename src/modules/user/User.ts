import type { UserResolvers } from "../common/schema.ts";
import * as createdAt from "./User.createdAt.ts";
import * as email from "./User.email.ts";
import * as id from "./User.id.ts";
import * as name from "./User.name.ts";
import * as token from "./User.token.ts";
import * as updatedAt from "./User.updatedAt.ts";

const typeDef = /* GraphQL */ `
  type User implements Node
`;

export const typeDefs = [
  typeDef,
  createdAt.typeDef,
  email.typeDef,
  id.typeDef,
  name.typeDef,
  token.typeDef,
  updatedAt.typeDef,
];

export const resolvers: UserResolvers = {
  createdAt: createdAt.resolver,
  email: email.resolver,
  id: id.resolver,
  name: name.resolver,
  token: token.resolver,
  updatedAt: updatedAt.resolver,
};
