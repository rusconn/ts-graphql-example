import { describe, test, expect } from "vitest";

import { admin, alice, guest } from "tests/data/context.js";
import { AuthorizationError as AuthErr } from "../common/authorizers.js";
import { ParseError as ParseErr } from "../common/parsers.js";
import { UserOrderField, OrderDirection } from "../common/schema.js";
import { authorizer as auth, parser as parse } from "./Query.users.js";

describe("Authorization", () => {
  const allow = [admin];

  const deny = [alice, guest];

  test.each(allow)("allow %#", user => {
    expect(() => auth(user)).not.toThrow(AuthErr);
  });

  test.each(deny)("deny %#", user => {
    expect(() => auth(user)).toThrow(AuthErr);
  });
});

describe("Parsing", () => {
  const firstMax = 30;
  const lastMax = 30;

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
    field: UserOrderField.CreatedAt,
    direction: OrderDirection.Desc,
  };

  test.each(valid)("valid %#", args => {
    expect(() => parse({ ...args, orderBy })).not.toThrow(ParseErr);
  });

  test.each(invalid)("invalid %#", args => {
    expect(() => parse({ ...args, orderBy })).toThrow(ParseErr);
  });
});
