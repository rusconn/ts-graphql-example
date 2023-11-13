import { admin, alice, guest } from "tests/data/context.js";
import { AuthorizationError as AuthErr } from "../common/authorizers.js";
import { authorizer as auth } from "./Query.me.js";

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
