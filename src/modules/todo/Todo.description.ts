import type { TodoResolvers } from "../common/schema.js";
import { isTodoOwner } from "./common/authorizer.js";
import { fullTodo } from "./common/resolver.js";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    description: String
  }
`;

export const resolver: TodoResolvers["description"] = async (parent, _args, context) => {
  const todo = await fullTodo(context.prisma, parent);

  authorizer(context.user, todo);

  return todo.description;
};

const authorizer = isTodoOwner;

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.js");
  const { adminTodo1: adminTodo, aliceTodo } = await import("tests/data/db.js");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.js");

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
