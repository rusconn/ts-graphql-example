import { ulid } from "ulid";

import { isAuthenticated } from "../common/authorizers.ts";
import { ParseError } from "../common/parsers.ts";
import { full } from "../common/resolvers.ts";
import type { MutationResolvers, MutationCreateTodoArgs } from "../common/schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    createTodo(input: CreateTodoInput!): CreateTodoResult
  }

  input CreateTodoInput {
    "100文字まで"
    title: NonEmptyString!
    "5000文字まで"
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

  if ([...title].length > 100) {
    throw new ParseError("`title` must be up to 100 characters");
  }
  if ([...description].length > 5000) {
    throw new ParseError("`description` must be up to 5000 characters");
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
      expect(() => parser({ input })).not.toThrow(ParseErr);
    });

    test.each(invalid)("invalid %#", input => {
      expect(() => parser({ input })).toThrow(ParseErr);
    });
  });
}
