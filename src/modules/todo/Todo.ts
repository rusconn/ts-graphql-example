import type { TodoResolvers } from "../common/schema.js";
import * as createdAt from "./Todo.createdAt.js";
import * as description from "./Todo.description.js";
import * as id from "./Todo.id.js";
import * as status from "./Todo.status.js";
import * as title from "./Todo.title.js";
import * as updatedAt from "./Todo.updatedAt.js";
import * as user from "./Todo.user.js";

const typeDef = /* GraphQL */ `
  type Todo implements Node
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
