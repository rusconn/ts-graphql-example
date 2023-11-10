import { describe, test, expect } from "vitest";

import { validUserIds, invalidUserIds } from "tests/data/graph";
import { ParseError as ParseErr } from "../common/parsers";
import * as Graph from "../common/schema";
import { parsers as parse } from "./parsers";

describe("Query.users", () => {
  const firstMax = 30;
  const lastMax = 30;

  const orderBy = {
    field: Graph.UserOrderField.CreatedAt,
    direction: Graph.OrderDirection.Desc,
  };

  const valid = [{ first: 10 }, { last: 10 }, { first: firstMax }, { last: lastMax }];

  const invalid = [
    {},
    { first: null },
    { last: null },
    { first: null, last: null },
    { first: firstMax + 1 },
    { last: lastMax + 1 },
  ];

  test.each(valid)("%o", args => {
    expect(() => parse.Query.users({ ...args, orderBy })).not.toThrow(ParseErr);
  });

  test.each(invalid)("%o", args => {
    expect(() => parse.Query.users({ ...args, orderBy })).toThrow(ParseErr);
  });
});

describe("Query.user", () => {
  test.each(validUserIds)("valid %s", async id => {
    expect(() => parse.Query.user({ id })).not.toThrow(ParseErr);
  });

  test.each(invalidUserIds)("invalid %s", async id => {
    expect(() => parse.Query.user({ id })).toThrow(ParseErr);
  });
});

describe("Mutation.signup", () => {
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
  ] as Graph.MutationSignupArgs["input"][];

  const invalid = [
    { ...validInput, name: "A".repeat(nameMax + 1) },
    { ...validInput, name: "🅰".repeat(nameMax + 1) },
    { ...validInput, email: `${"A".repeat(emailMax - 10 + 1)}@email.com` },
    { ...validInput, email: `${"🅰".repeat(emailMax - 10 + 1)}@email.com` },
    { ...validInput, password: "A".repeat(passMin - 1) },
    { ...validInput, password: "🅰".repeat(passMax + 1) },
  ] as Graph.MutationSignupArgs["input"][];

  test.each(valid)("valid %o", async input => {
    expect(() => parse.Mutation.signup({ input })).not.toThrow(ParseErr);
  });

  test.each(invalid)("invalid %o", async input => {
    expect(() => parse.Mutation.signup({ input })).toThrow(ParseErr);
  });
});

describe("Mutation.login", () => {
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
  ] as Graph.MutationLoginArgs["input"][];

  const invalid = [
    { ...validInput, email: `${"A".repeat(emailMax - 10 + 1)}@email.com` },
    { ...validInput, email: `${"🅰".repeat(emailMax - 10 + 1)}@email.com` },
    { ...validInput, password: "A".repeat(passMin - 1) },
    { ...validInput, password: "🅰".repeat(passMax + 1) },
  ] as Graph.MutationLoginArgs["input"][];

  test.each(valid)("valid %o", async input => {
    expect(() => parse.Mutation.login({ input })).not.toThrow(ParseErr);
  });

  test.each(invalid)("invalid %o", async input => {
    expect(() => parse.Mutation.login({ input })).toThrow(ParseErr);
  });
});

describe("Mutation.updateMe", () => {
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
  ] as Graph.MutationUpdateMeArgs["input"][];

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
  ] as Graph.MutationUpdateMeArgs["input"][];

  test.each(valid)("valid %o", async input => {
    expect(() => parse.Mutation.updateMe({ input })).not.toThrow(ParseErr);
  });

  test.each(invalid)("invalid %o", async input => {
    expect(() => parse.Mutation.updateMe({ input })).toThrow(ParseErr);
  });
});
