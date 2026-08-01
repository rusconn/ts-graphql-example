import type { UserResolvers } from "./_types.ts";
import { nodeId } from "./Node/id.ts";
import * as todo from "./User/todo.ts";
import * as todos from "./User/todos.ts";

export const userId = nodeId("User");

export const typeDefs = [
  /* GraphQL */ `
    type User implements Node {
      id: ID! @auth(policy: ADMIN_OR_USER_OWNER)
      name: String @semanticNonNull @auth(policy: ADMIN_OR_USER_OWNER)
      email: EmailAddress @semanticNonNull @auth(policy: ADMIN_OR_USER_OWNER)
      createdAt: DateTimeISO @semanticNonNull @auth(policy: ADMIN_OR_USER_OWNER)
      updatedAt: DateTimeISO @semanticNonNull @auth(policy: ADMIN_OR_USER_OWNER)
    }
  `,
  todo.typeDef,
  todos.typeDef,
];

export const resolvers: UserResolvers = {
  id(parent) {
    return userId(parent.id);
  },
  todo: todo.resolver,
  todos: todos.resolver,
};
