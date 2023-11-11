import { describe, test, expect } from "vitest";

import { admin, alice, guest } from "tests/data/context";
import { AuthorizationError as AuthErr } from "../common/authorizers";
import { authorizer as auth } from "./Query.me";

describe("Authorization", () => {
  const allow = [admin, alice];

  const deny = [guest];

  test.each(allow)("allow %#", user => {
    expect(() => auth(user)).not.toThrow(AuthErr);
  });

  test.each(deny)("deny %#", user => {
    expect(() => auth(user)).toThrow(AuthErr);
  });
});
