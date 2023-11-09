import { admin, alice, guest } from "tests/data/context";
import { AuthorizationError as AuthErr } from "../common/authorizers";
import { authorizers as auth } from "./authorizers";

describe("Query.node", () => {
  const allow = [admin, alice];

  const deny = [guest];

  test.each(allow)("%o", user => {
    expect(() => auth.Query.node(user)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o", user => {
    expect(() => auth.Query.node(user)).toThrow(AuthErr);
  });
});
