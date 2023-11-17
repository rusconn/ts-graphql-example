import { ulid } from "ulid";

import { isAuthenticated } from "../common/authorizers.ts";
import { ParseError } from "../common/parsers.ts";
import { full } from "../common/resolvers.ts";
import type { MutationResolvers, MutationCreateTodoArgs } from "../common/schema.ts";

const TITLE_MAX = 100;
const DESC_MAX = 5000;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    createTodo(input: CreateTodoInput!): CreateTodoResult
  }

  input CreateTodoInput {
    "${TITLE_MAX}文字まで"
    title: NonEmptyString!
    "${DESC_MAX}文字まで"
    description: String!
  }

  union CreateTodoResult = CreateTodoSuccess

  type CreateTodoSuccess {
    todo: Todo!
  }
`;

export const resolver: MutationResolvers["createTodo"] = async (_parent, args, context) => {
  const authed = authorizer(context.user);

  const parsed = parser(args);

  const todo = await context.prisma.todo.create({
    data: { id: ulid(), userId: authed.id, ...parsed },
  });

  return {
    __typename: "CreateTodoSuccess",
    todo: full(todo),
  };
};

const authorizer = isAuthenticated;

const parser = (args: MutationCreateTodoArgs) => {
  const { title, description } = args.input;

  if ([...title].length > TITLE_MAX) {
    throw new ParseError(`"title" must be up to ${TITLE_MAX} characters`);
  }
  if ([...description].length > DESC_MAX) {
    throw new ParseError(`"description" must be up to ${DESC_MAX} characters`);
  }

  return { title, description };
};

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");
  const { ParseError: ParseErr } = await import("../common/parsers.ts");

  describe("Authorization", () => {
    const allow = [admin, alice];

    const deny = [guest];

    test.each(allow)("allow %#", user => {
      expect(() => authorizer(user)).not.toThrow(AuthErr);
    });

    test.each(deny)("deny %#", user => {
      expect(() => authorizer(user)).toThrow(AuthErr);
    });
  });

  describe("Parsing", () => {
    const validInput = { title: "title", description: "description" };

    const valid = [
      { ...validInput },
      { ...validInput, title: "A".repeat(TITLE_MAX) },
      { ...validInput, title: "🅰".repeat(TITLE_MAX) },
      { ...validInput, description: "A".repeat(DESC_MAX) },
      { ...validInput, description: "🅰".repeat(DESC_MAX) },
    ] as MutationCreateTodoArgs["input"][];

    const invalid = [
      { ...validInput, title: "A".repeat(TITLE_MAX + 1) },
      { ...validInput, title: "🅰".repeat(TITLE_MAX + 1) },
      { ...validInput, description: "A".repeat(DESC_MAX + 1) },
      { ...validInput, description: "🅰".repeat(DESC_MAX + 1) },
    ] as MutationCreateTodoArgs["input"][];

    test.each(valid)("valid %#", input => {
      expect(() => parser({ input })).not.toThrow(ParseErr);
    });

    test.each(invalid)("invalid %#", input => {
      expect(() => parser({ input })).toThrow(ParseErr);
    });
  });
}
