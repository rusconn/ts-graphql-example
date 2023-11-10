import { describe, test, expect } from "vitest";

import { validTodoIds, invalidTodoIds } from "tests/data/graph";
import { ParseError as ParseErr } from "../common/parsers";
import * as Graph from "../common/schema";
import { parsers as parse } from "./parsers";

describe("Mutation.createTodo", () => {
  const titleMax = 100;
  const descMax = 5000;

  const validInput = { title: "title", description: "description" };

  const valid = [
    { ...validInput },
    { ...validInput, title: "A".repeat(titleMax) },
    { ...validInput, title: "🅰".repeat(titleMax) },
    { ...validInput, description: "A".repeat(descMax) },
    { ...validInput, description: "🅰".repeat(descMax) },
  ] as Graph.MutationCreateTodoArgs["input"][];

  const invalid = [
    { ...validInput, title: "A".repeat(titleMax + 1) },
    { ...validInput, title: "🅰".repeat(titleMax + 1) },
    { ...validInput, description: "A".repeat(descMax + 1) },
    { ...validInput, description: "🅰".repeat(descMax + 1) },
  ] as Graph.MutationCreateTodoArgs["input"][];

  test.each(valid)("valid %o", async input => {
    expect(() => parse.Mutation.createTodo({ input })).not.toThrow(ParseErr);
  });

  test.each(invalid)("invalid %o", async input => {
    expect(() => parse.Mutation.createTodo({ input })).toThrow(ParseErr);
  });
});

describe("Mutation.updateTodo", () => {
  describe("id", () => {
    const input = {
      title: "title",
      description: "description",
      status: Graph.TodoStatus.Done,
    } as Graph.MutationUpdateTodoArgs["input"];

    test.each(validTodoIds)("valid %s", async id => {
      expect(() => parse.Mutation.updateTodo({ id, input })).not.toThrow(ParseErr);
    });

    test.each(invalidTodoIds)("invalid %s", async id => {
      expect(() => parse.Mutation.updateTodo({ id, input })).toThrow(ParseErr);
    });
  });

  describe("input", () => {
    const titleMax = 100;
    const descMax = 5000;

    const id = validTodoIds[0];

    const valid = [
      { title: "title" },
      { description: "description" },
      { status: Graph.TodoStatus.Done },
      { title: "title", description: "description", status: Graph.TodoStatus.Done },
      { title: "A".repeat(titleMax) },
      { title: "🅰".repeat(titleMax) },
      { description: "A".repeat(descMax) },
      { description: "🅰".repeat(descMax) },
    ] as Graph.MutationUpdateTodoArgs["input"][];

    const invalid = [
      { title: null },
      { description: null },
      { status: null },
      { title: "A".repeat(titleMax + 1) },
      { title: "🅰".repeat(titleMax + 1) },
      { description: "A".repeat(descMax + 1) },
      { description: "🅰".repeat(descMax + 1) },
    ] as Graph.MutationUpdateTodoArgs["input"][];

    test.each(valid)("valid %o", async input => {
      expect(() => parse.Mutation.updateTodo({ id, input })).not.toThrow(ParseErr);
    });

    test.each(invalid)("invalid %o", async input => {
      expect(() => parse.Mutation.updateTodo({ id, input })).toThrow(ParseErr);
    });
  });
});

describe("Mutation.deleteTodo", () => {
  test.each(validTodoIds)("valid %s", async id => {
    expect(() => parse.Mutation.deleteTodo({ id })).not.toThrow(ParseErr);
  });

  test.each(invalidTodoIds)("invalid %s", async id => {
    expect(() => parse.Mutation.deleteTodo({ id })).toThrow(ParseErr);
  });
});

describe("Mutation.completeTodo", () => {
  test.each(validTodoIds)("valid %s", async id => {
    expect(() => parse.Mutation.completeTodo({ id })).not.toThrow(ParseErr);
  });

  test.each(invalidTodoIds)("invalid %s", async id => {
    expect(() => parse.Mutation.completeTodo({ id })).toThrow(ParseErr);
  });
});

describe("Mutation.uncompleteTodo", () => {
  test.each(validTodoIds)("valid %s", async id => {
    expect(() => parse.Mutation.uncompleteTodo({ id })).not.toThrow(ParseErr);
  });

  test.each(invalidTodoIds)("invalid %s", async id => {
    expect(() => parse.Mutation.uncompleteTodo({ id })).toThrow(ParseErr);
  });
});

describe("User.todo", () => {
  test.each(validTodoIds)("valid %s", async id => {
    expect(() => parse.User.todo({ id })).not.toThrow(ParseErr);
  });

  test.each(invalidTodoIds)("invalid %s", async id => {
    expect(() => parse.User.todo({ id })).toThrow(ParseErr);
  });
});

describe("User.todos", () => {
  const firstMax = 50;
  const lastMax = 50;

  const orderBy = {
    field: Graph.TodoOrderField.UpdatedAt,
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

  test.each(valid)("valid %o", async args => {
    expect(() => parse.User.todos({ ...args, orderBy })).not.toThrow(ParseErr);
  });

  test.each(invalid)("invalid %o", async args => {
    expect(() => parse.User.todos({ ...args, orderBy })).toThrow(ParseErr);
  });
});
