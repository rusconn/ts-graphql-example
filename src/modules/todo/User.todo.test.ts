import { describe, test, expect } from "vitest";

import { admin, alice, guest } from "tests/data/context";
import { validTodoIds, invalidTodoIds } from "tests/data/graph";
import { AuthorizationError as AuthErr } from "../common/authorizers";
import { ParseError as ParseErr } from "../common/parsers";
import { authorizer as auth, parser as parse } from "./User.todo";

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

describe("Parsing", () => {
  test.each(validTodoIds)("valid %#", id => {
    expect(() => parse(id)).not.toThrow(ParseErr);
  });

  test.each(invalidTodoIds)("invalid %#", id => {
    expect(() => parse(id)).toThrow(ParseErr);
  });
});
