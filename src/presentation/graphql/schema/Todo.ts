import { assertAdminOrTodoOwner } from "./_authorizers/todo/admin-or-owner.ts";
import { assertTodoOwner } from "./_authorizers/todo/owner.ts";
import type { TodoResolvers } from "./_types.ts";
import { nodeId } from "./Node/id.ts";
import * as user from "./Todo/user.ts";

export const todoId = nodeId("Todo");

export const typeDefs = [
  /* GraphQL */ `
    type Todo implements Node {
      """
      所有者、管理者のみ
      """
      id: ID!

      """
      所有者のみ
      """
      title: String @semanticNonNull

      """
      所有者のみ
      """
      description: String @semanticNonNull

      """
      所有者のみ
      """
      status: TodoStatus @semanticNonNull

      """
      所有者、管理者のみ
      """
      createdAt: DateTimeISO @semanticNonNull

      """
      所有者、管理者のみ
      """
      updatedAt: DateTimeISO @semanticNonNull
    }

    enum TodoStatus {
      DONE
      PENDING
    }
  `,
  user.typeDef,
];

export const resolvers: TodoResolvers = {
  id(parent, _args, ctx) {
    assertAdminOrTodoOwner(ctx, parent);
    return todoId(parent.id);
  },
  title(parent, _args, ctx) {
    assertTodoOwner(ctx, parent);
    return parent.title;
  },
  description(parent, _args, ctx) {
    assertTodoOwner(ctx, parent);
    return parent.description;
  },
  status(parent, _args, ctx) {
    assertTodoOwner(ctx, parent);
    return parent.status;
  },
  createdAt(parent, _args, ctx) {
    assertAdminOrTodoOwner(ctx, parent);
    return parent.createdAt;
  },
  updatedAt(parent, _args, ctx) {
    assertAdminOrTodoOwner(ctx, parent);
    return parent.updatedAt;
  },
  user: user.resolver,
};
