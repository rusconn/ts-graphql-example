import type { TodoResolvers } from "../common/schema";
import * as createdAt from "./Todo.createdAt";
import * as description from "./Todo.description";
import * as id from "./Todo.id";
import * as status from "./Todo.status";
import * as title from "./Todo.title";
import * as updatedAt from "./Todo.updatedAt";
import * as user from "./Todo.user";

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
