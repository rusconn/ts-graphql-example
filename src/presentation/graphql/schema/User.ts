import type { UserResolvers } from "./_types.ts";
import * as createdAt from "./User/createdAt.ts";
import * as email from "./User/email.ts";
import * as id from "./User/id.ts";
import * as name from "./User/name.ts";
import * as todo from "./User/todo.ts";
import * as todos from "./User/todos.ts";
import * as updatedAt from "./User/updatedAt.ts";

const typeDef = /* GraphQL */ `
  type User
`;

export const typeDefs = [
  typeDef,
  createdAt.typeDef,
  email.typeDef,
  id.typeDef,
  name.typeDef,
  todo.typeDef,
  todos.typeDef,
  updatedAt.typeDef,
];

export const resolvers: UserResolvers = {
  createdAt: createdAt.resolver,
  email: email.resolver,
  id: id.resolver,
  name: name.resolver,
  todo: todo.resolver,
  todos: todos.resolver,
  updatedAt: updatedAt.resolver,
};
