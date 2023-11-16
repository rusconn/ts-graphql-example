import type { TodoResolvers } from "../common/schema.ts";
import { isTodoOwner } from "./common/authorizer.ts";
import { fullTodo } from "./common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    title: NonEmptyString
  }
`;

export const resolver: TodoResolvers["title"] = async (parent, _args, context) => {
  const todo = await fullTodo(context.prisma, parent);

  authorizer(context.user, todo);

  return todo.title;
};

const authorizer = isTodoOwner;

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { adminTodo1: adminTodo, aliceTodo } = await import("tests/data/db.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");

  describe("Authorization", () => {
    const allow = [
      [admin, adminTodo],
      [alice, aliceTodo],
    ] as const;

    const deny = [
      [admin, aliceTodo],
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
