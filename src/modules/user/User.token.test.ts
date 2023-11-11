import { describe, test, expect } from "vitest";

import { admin, alice, guest } from "tests/data/context";
import { AuthorizationError as AuthErr } from "../common/authorizers";
import { authorizer as auth } from "./User.token";

describe("Authorization", () => {
  const allow = [
    [admin, admin],
    [alice, alice],
    [guest, guest],
  ] as const;

  const deny = [
    [admin, alice],
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
