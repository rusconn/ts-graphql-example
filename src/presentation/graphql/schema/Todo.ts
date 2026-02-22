import type { TodoResolvers } from "./_types.ts";
import * as createdAt from "./Todo/createdAt.ts";
import * as description from "./Todo/description.ts";
import * as id from "./Todo/id.ts";
import * as status from "./Todo/status.ts";
import * as title from "./Todo/title.ts";
import * as updatedAt from "./Todo/updatedAt.ts";
import * as user from "./Todo/user.ts";

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
