import type { UserResolvers } from "../../../schema.ts";
import * as createdAt from "./createdAt.ts";
import * as email from "./email.ts";
import * as id from "./id.ts";
import * as name from "./name.ts";
import * as token from "./token.ts";
import * as updatedAt from "./updatedAt.ts";

const typeDef = /* GraphQL */ `
  type User
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
