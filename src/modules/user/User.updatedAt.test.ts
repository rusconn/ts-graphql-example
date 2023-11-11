import { describe, test, expect } from "vitest";

import { admin, alice, guest } from "tests/data/context";
import { AuthorizationError as AuthErr } from "../common/authorizers";
import { authorizer as auth } from "./User.updatedAt";

describe("Authorization", () => {
  const allow = [
    [admin, admin],
    [admin, alice],
    [alice, alice],
  ] as const;

  const deny = [
    [alice, admin],
    [guest, admin],
    [guest, alice],
  ] as const;

  test.each(allow)("allow %#", (user, parent) => {
    expect(() => auth(user, parent)).not.toThrow(AuthErr);
  });

  test.each(deny)("deny %#", (user, parent) => {
    expect(() => auth(user, parent)).toThrow(AuthErr);
  });
});
