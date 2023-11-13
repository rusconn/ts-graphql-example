import { admin, alice, guest } from "tests/data/context.js";
import { AuthorizationError as AuthErr } from "../common/authorizers.js";
import { ParseError as ParseErr } from "../common/parsers.js";
import type { MutationUpdateMeArgs } from "../common/schema.js";
import { authorizer as auth, parser as parse } from "./Mutation.updateMe.js";

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
  const nameMax = 100;
  const emailMax = 100;
  const passMin = 8;
  const passMax = 50;

  const valid = [
    { name: "name" },
    { email: "email@email.com" },
    { password: "password" },
    { name: "name", email: "email@email.com", password: "password" },
    { name: "A".repeat(nameMax) },
    { name: "🅰".repeat(nameMax) },
    { email: `${"A".repeat(emailMax - 10)}@email.com` },
    { email: `${"🅰".repeat(emailMax - 10)}@email.com` },
    { password: "A".repeat(passMin) },
    { password: "🅰".repeat(passMax) },
  ] as MutationUpdateMeArgs["input"][];

  const invalid = [
    { name: null },
    { email: null },
    { password: null },
    { name: "A".repeat(nameMax + 1) },
    { name: "🅰".repeat(nameMax + 1) },
    { email: `${"A".repeat(emailMax - 10 + 1)}@email.com` },
    { email: `${"🅰".repeat(emailMax - 10 + 1)}@email.com` },
    { password: "A".repeat(passMin - 1) },
    { password: "🅰".repeat(passMax + 1) },
  ] as MutationUpdateMeArgs["input"][];

  test.each(valid)("valid %#", input => {
    expect(() => parse({ input })).not.toThrow(ParseErr);
  });

  test.each(invalid)("invalid %#", input => {
    expect(() => parse({ input })).toThrow(ParseErr);
  });
});
