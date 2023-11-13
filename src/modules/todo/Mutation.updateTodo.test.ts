import { admin, alice, guest } from "tests/data/context.js";
import { validTodoIds, invalidTodoIds } from "tests/data/graph.js";
import { AuthorizationError as AuthErr } from "../common/authorizers.js";
import { ParseError as ParseErr } from "../common/parsers.js";
import { MutationUpdateTodoArgs, TodoStatus } from "../common/schema.js";
import { authorizer as auth, parser as parse } from "./Mutation.updateTodo.js";

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
  describe("id", () => {
    const input = {
      title: "title",
      description: "description",
      status: TodoStatus.Done,
    } as MutationUpdateTodoArgs["input"];

    test.each(validTodoIds)("valid %#", id => {
      expect(() => parse({ id, input })).not.toThrow(ParseErr);
    });

    test.each(invalidTodoIds)("invalid %#", id => {
      expect(() => parse({ id, input })).toThrow(ParseErr);
    });
  });

  describe("input", () => {
    const titleMax = 100;
    const descMax = 5000;

    const id = validTodoIds[0];

    const valid = [
      { title: "title" },
      { description: "description" },
      { status: TodoStatus.Done },
      { title: "title", description: "description", status: TodoStatus.Done },
      { title: "A".repeat(titleMax) },
      { title: "🅰".repeat(titleMax) },
      { description: "A".repeat(descMax) },
      { description: "🅰".repeat(descMax) },
    ] as MutationUpdateTodoArgs["input"][];

    const invalid = [
      { title: null },
      { description: null },
      { status: null },
      { title: "A".repeat(titleMax + 1) },
      { title: "🅰".repeat(titleMax + 1) },
      { description: "A".repeat(descMax + 1) },
      { description: "🅰".repeat(descMax + 1) },
    ] as MutationUpdateTodoArgs["input"][];

    test.each(valid)("valid %#", input => {
      expect(() => parse({ id, input })).not.toThrow(ParseErr);
    });

    test.each(invalid)("invalid %#", input => {
      expect(() => parse({ id, input })).toThrow(ParseErr);
    });
  });
});
