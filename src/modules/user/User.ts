import type { UserResolvers } from "../common/schema.js";
import * as createdAt from "./User.createdAt.js";
import * as email from "./User.email.js";
import * as id from "./User.id.js";
import * as name from "./User.name.js";
import * as token from "./User.token.js";
import * as updatedAt from "./User.updatedAt.js";

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
