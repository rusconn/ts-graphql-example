import type { TodoResolvers } from "../_schema.ts";
import * as createdAt from "./createdAt.ts";
import * as description from "./description.ts";
import * as id from "./id.ts";
import * as status from "./status.ts";
import * as title from "./title.ts";
import * as updatedAt from "./updatedAt.ts";
import * as user from "./user.ts";

const typeDef = /* GraphQL */ `
  type Todo
`;

export const typeDefs = [
  typeDef,
  createdAt.typeDef,
  description.typeDef,
  id.typeDef,
  status.typeDef,
  title.typeDef,
  updatedAt.typeDef,
  user.typeDef,
];

export const resolvers: TodoResolvers = {
  createdAt: createdAt.resolver,
  description: description.resolver,
  id: id.resolver,
  status: status.resolver,
  title: title.resolver,
  updatedAt: updatedAt.resolver,
  user: user.resolver,
};
