import { assertAdminOrUserOwner } from "./_authorizers/user/admin-or-owner.ts";
import type { UserResolvers } from "./_types.ts";
import { nodeId } from "./Node/id.ts";
import * as todo from "./User/todo.ts";
import * as todos from "./User/todos.ts";

export const userId = nodeId("User");

export const typeDefs = [
  /* GraphQL */ `
    type User implements Node {
      """
      本人、管理者のみ
      """
      id: ID!

      """
      本人、管理者のみ
      """
      name: String @semanticNonNull

      """
      本人、管理者のみ
      """
      email: EmailAddress @semanticNonNull

      """
      本人、管理者のみ
      """
      createdAt: DateTimeISO @semanticNonNull

      """
      本人、管理者のみ
      """
      updatedAt: DateTimeISO @semanticNonNull
    }
  `,
  todo.typeDef,
  todos.typeDef,
];

export const resolvers: UserResolvers = {
  id(parent, _args, ctx) {
    assertAdminOrUserOwner(ctx, parent);
    return userId(parent.id);
  },
  name(parent, _args, ctx) {
    assertAdminOrUserOwner(ctx, parent);
    return parent.name;
  },
  email(parent, _args, ctx) {
    assertAdminOrUserOwner(ctx, parent);
    return parent.email;
  },
  createdAt(parent, _args, ctx) {
    assertAdminOrUserOwner(ctx, parent);
    return parent.createdAt;
  },
  updatedAt(parent, _args, ctx) {
    assertAdminOrUserOwner(ctx, parent);
    return parent.updatedAt;
  },
  todo: todo.resolver,
  todos: todos.resolver,
};
