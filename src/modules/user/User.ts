import type { UserResolvers } from "../common/schema";
import * as createdAt from "./User.createdAt";
import * as email from "./User.email";
import * as id from "./User.id";
import * as name from "./User.name";
import * as token from "./User.token";
import * as updatedAt from "./User.updatedAt";

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
