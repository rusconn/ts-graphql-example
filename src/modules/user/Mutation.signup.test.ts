import { describe, test, expect } from "vitest";

import { admin, alice, guest } from "tests/data/context.js";
import { AuthorizationError as AuthErr } from "../common/authorizers.js";
import { ParseError as ParseErr } from "../common/parsers.js";
import type { MutationSignupArgs } from "../common/schema.js";
import { authorizer as auth, parser as parse } from "./Mutation.signup.js";

describe("Authorization", () => {
  const allow = [guest];

  const deny = [admin, alice];

  test.each(allow)("allow %#", user => {
    expect(() => auth(user)).not.toThrow(AuthErr);
  });

  test.each(deny)("deny %#", user => {
    expect(() => auth(user)).toThrow(AuthErr);
  });
});

describe("Parsing", () => {
  const nameMax = 100;
  const emailMax = 100;
  const passMin = 8;
  const passMax = 50;

  const validInput = { name: "name", email: "email@email.com", password: "password" };

  const valid = [
    { ...validInput },
    { ...validInput, name: "A".repeat(nameMax) },
    { ...validInput, name: "🅰".repeat(nameMax) },
    { ...validInput, email: `${"A".repeat(emailMax - 10)}@email.com` },
    { ...validInput, email: `${"🅰".repeat(emailMax - 10)}@email.com` },
    { ...validInput, password: "A".repeat(passMin) },
    { ...validInput, password: "🅰".repeat(passMax) },
  ] as MutationSignupArgs["input"][];

  const invalid = [
    { ...validInput, name: "A".repeat(nameMax + 1) },
    { ...validInput, name: "🅰".repeat(nameMax + 1) },
    { ...validInput, email: `${"A".repeat(emailMax - 10 + 1)}@email.com` },
    { ...validInput, email: `${"🅰".repeat(emailMax - 10 + 1)}@email.com` },
    { ...validInput, password: "A".repeat(passMin - 1) },
    { ...validInput, password: "🅰".repeat(passMax + 1) },
  ] as MutationSignupArgs["input"][];

  test.each(valid)("valid %#", input => {
    expect(() => parse({ input })).not.toThrow(ParseErr);
  });

  test.each(invalid)("invalid %#", input => {
    expect(() => parse({ input })).toThrow(ParseErr);
  });
});
