import { describe, test, expect } from "vitest";

import { admin, alice, guest } from "tests/data/context";
import { AuthorizationError as AuthErr } from "../common/authorizers";
import { ParseError as ParseErr } from "../common/parsers";
import type { MutationLoginArgs } from "../common/schema";
import { authorizer as auth, parser as parse } from "./Mutation.login";

describe("Authorization", () => {
  const allow = [admin, alice, guest];

  test.each(allow)("allow %#", user => {
    expect(() => auth(user)).not.toThrow(AuthErr);
  });
});

describe("Parsing", () => {
  const emailMax = 100;
  const passMin = 8;
  const passMax = 50;

  const validInput = { email: "email@email.com", password: "password" };

  const valid = [
    { ...validInput },
    { ...validInput, email: `${"A".repeat(emailMax - 10)}@email.com` },
    { ...validInput, email: `${"🅰".repeat(emailMax - 10)}@email.com` },
    { ...validInput, password: "A".repeat(passMin) },
    { ...validInput, password: "🅰".repeat(passMax) },
  ] as MutationLoginArgs["input"][];

  const invalid = [
    { ...validInput, email: `${"A".repeat(emailMax - 10 + 1)}@email.com` },
    { ...validInput, email: `${"🅰".repeat(emailMax - 10 + 1)}@email.com` },
    { ...validInput, password: "A".repeat(passMin - 1) },
    { ...validInput, password: "🅰".repeat(passMax + 1) },
  ] as MutationLoginArgs["input"][];

  test.each(valid)("valid %#", input => {
    expect(() => parse({ input })).not.toThrow(ParseErr);
  });

  test.each(invalid)("invalid %#", input => {
    expect(() => parse({ input })).toThrow(ParseErr);
  });
});
