import { describe, test, expect } from "vitest";

import { admin, alice, guest } from "tests/data/context";
import { adminTodo1 as adminTodo, aliceTodo } from "tests/data/db";
import { AuthorizationError as AuthErr } from "../common/authorizers";
import { authorizer as auth } from "./Todo.status";

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
    expect(() => auth(user, todo)).not.toThrow(AuthErr);
  });

  test.each(deny)("deny %#", (user, todo) => {
    expect(() => auth(user, todo)).toThrow(AuthErr);
  });
});
