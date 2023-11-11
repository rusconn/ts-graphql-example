import { describe, test, expect } from "vitest";

import { admin, alice, guest } from "tests/data/context";
import { validNodeIds, invalidIds } from "tests/data/graph";
import { AuthorizationError as AuthErr } from "../common/authorizers";
import { ParseError as ParseErr } from "../common/parsers";
import { authorizer as auth, parser as parse } from "./Query.node";

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

describe("Parsing", () => {
  test.each(validNodeIds)("valid %#", id => {
    expect(() => parse({ id })).not.toThrow(ParseErr);
  });

  test.each(invalidIds)("invalid %#", id => {
    expect(() => parse({ id })).toThrow(ParseErr);
  });
});
