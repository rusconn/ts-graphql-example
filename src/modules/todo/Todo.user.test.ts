import { describe, test, expect } from "vitest";

import { admin, alice, guest } from "tests/data/context.js";
import { adminTodo1 as adminTodo, aliceTodo } from "tests/data/db.js";
import { AuthorizationError as AuthErr } from "../common/authorizers.js";
import { authorizer as auth } from "./Todo.user.js";

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
    expect(() => auth(user, todo)).not.toThrow(AuthErr);
  });

  test.each(deny)("deny %#", (user, todo) => {
    expect(() => auth(user, todo)).toThrow(AuthErr);
  });
});
