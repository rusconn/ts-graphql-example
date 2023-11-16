import { key } from "../common/resolvers.ts";
import type { TodoResolvers } from "../common/schema.ts";
import { isAdminOrTodoOwner } from "./common/authorizer.ts";
import { fullTodo } from "./common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    user: User
  }
`;

export const resolver: TodoResolvers["user"] = async (parent, _args, context) => {
  const todo = await fullTodo(context.prisma, parent);

  authorizer(context.user, todo);

  return key({ id: todo.userId });
};

const authorizer = isAdminOrTodoOwner;

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { adminTodo1: adminTodo, aliceTodo } = await import("tests/data/db.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");

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
