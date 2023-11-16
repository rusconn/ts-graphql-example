import type { TodoResolvers } from "../common/schema.js";
import { isAdminOrTodoOwner } from "./common/authorizer.js";
import { fullTodo } from "./common/resolver.js";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    updatedAt: DateTime
  }
`;

export const resolver: TodoResolvers["updatedAt"] = async (parent, _args, context) => {
  const todo = await fullTodo(context.prisma, parent);

  authorizer(context.user, todo);

  return todo.updatedAt;
};

const authorizer = isAdminOrTodoOwner;

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.js");
  const { adminTodo1: adminTodo, aliceTodo } = await import("tests/data/db.js");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.js");

  describe("Authorization", () => {
    const allow = [
      [admin, adminTodo],
      [admin, aliceTodo],
      [alice, aliceTodo],
    ] as const;

    const deny = [
      [alice, adminTodo],
      [guest, adminTodo],
      [guest, aliceTodo],
    ] as const;

    test.each(allow)("allow %#", (user, todo) => {
      expect(() => authorizer(user, todo)).not.toThrow(AuthErr);
    });

    test.each(deny)("deny %#", (user, todo) => {
      expect(() => authorizer(user, todo)).toThrow(AuthErr);
    });
  });
}
