import { describe, test, expect } from "vitest";

import { admin, alice, guest } from "tests/data/context.js";
import { AuthorizationError as AuthErr } from "../common/authorizers.js";
import { ParseError as ParseErr } from "../common/parsers.js";
import type { MutationCreateTodoArgs } from "../common/schema.js";
import { authorizer as auth, parser as parse } from "./Mutation.createTodo.js";

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
  const titleMax = 100;
  const descMax = 5000;

  const validInput = { title: "title", description: "description" };

  const valid = [
    { ...validInput },
    { ...validInput, title: "A".repeat(titleMax) },
    { ...validInput, title: "🅰".repeat(titleMax) },
    { ...validInput, description: "A".repeat(descMax) },
    { ...validInput, description: "🅰".repeat(descMax) },
  ] as MutationCreateTodoArgs["input"][];

  const invalid = [
    { ...validInput, title: "A".repeat(titleMax + 1) },
    { ...validInput, title: "🅰".repeat(titleMax + 1) },
    { ...validInput, description: "A".repeat(descMax + 1) },
    { ...validInput, description: "🅰".repeat(descMax + 1) },
  ] as MutationCreateTodoArgs["input"][];

  test.each(valid)("valid %#", input => {
    expect(() => parse({ input })).not.toThrow(ParseErr);
  });

  test.each(invalid)("invalid %#", input => {
    expect(() => parse({ input })).toThrow(ParseErr);
  });
});
