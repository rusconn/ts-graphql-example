import { describe, test, expect } from "vitest";

import { admin, alice, guest } from "tests/data/context";
import { AuthorizationError as AuthErr } from "../common/authorizers";
import { ParseError as ParseErr } from "../common/parsers";
import { TodoOrderField, OrderDirection } from "../common/schema";
import { authorizer as auth, parser as parse } from "./User.todos";

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
  const firstMax = 50;
  const lastMax = 50;

  const valid = [{ first: 10 }, { last: 10 }, { first: firstMax }, { last: lastMax }];

  const invalid = [
    {},
    { first: null },
    { last: null },
    { first: null, last: null },
    { first: firstMax + 1 },
    { last: lastMax + 1 },
  ];

  const orderBy = {
    field: TodoOrderField.UpdatedAt,
    direction: OrderDirection.Desc,
  };

  test.each(valid)("valid %#", args => {
    expect(() => parse({ ...args, orderBy })).not.toThrow(ParseErr);
  });

  test.each(invalid)("invalid %#", args => {
    expect(() => parse({ ...args, orderBy })).toThrow(ParseErr);
  });
});
