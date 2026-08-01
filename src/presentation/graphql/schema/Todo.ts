import type { TodoResolvers } from "./_types.ts";
import { nodeId } from "./Node/id.ts";
import * as user from "./Todo/user.ts";

export const todoId = nodeId("Todo");

export const typeDefs = [
  /* GraphQL */ `
    type Todo implements Node {
      id: ID! @auth(policy: ADMIN_OR_TODO_OWNER)
      title: String @semanticNonNull @auth(policy: TODO_OWNER)
      description: String @semanticNonNull @auth(policy: TODO_OWNER)
      status: TodoStatus @semanticNonNull @auth(policy: TODO_OWNER)
      createdAt: DateTimeISO @semanticNonNull @auth(policy: ADMIN_OR_TODO_OWNER)
      updatedAt: DateTimeISO @semanticNonNull @auth(policy: ADMIN_OR_TODO_OWNER)
    }

    enum TodoStatus {
      DONE
      PENDING
    }
  `,
  user.typeDef,
];

export const resolvers: TodoResolvers = {
  id(parent) {
    return todoId(parent.id);
  },
  user: user.resolver,
};
