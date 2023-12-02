import { ulid } from "ulid";

import { authAuthenticated } from "../../common/authorizers.ts";
import { ParseError } from "../../common/parsers.ts";
import { full } from "../../common/resolvers.ts";
import type { MutationResolvers } from "../../common/schema.ts";

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
  const authed = authAuthenticated(context.user);

  const { title, description } = args.input;

  if ([...title].length > TITLE_MAX) {
    throw new ParseError(`"title" must be up to ${TITLE_MAX} characters`);
  }
  if ([...description].length > DESC_MAX) {
    throw new ParseError(`"description" must be up to ${DESC_MAX} characters`);
  }

  const todo = await context.prisma.todo.create({
    data: { id: ulid(), userId: authed.id, title, description },
  });

  return {
    __typename: "CreateTodoSuccess",
    todo: full(todo),
  };
};

if (import.meta.vitest) {
  const { AuthorizationError: AuthErr } = await import("../../common/authorizers.ts");
  const { ParseError: ParseErr } = await import("../../common/parsers.ts");
  const { dummyContext } = await import("../../common/tests.ts");
  const { context } = await import("../../user/common/test.ts");

  type Args = Parameters<typeof resolver>[1];
  type Params = Parameters<typeof dummyContext>[0];

  const valid = {
    args: { input: { title: "title", description: "description" } } as Args,
    user: context.admin,
  };

  const resolve = ({
    args = valid.args,
    user = valid.user,
  }: {
    args?: Args;
    user?: Params["user"];
  }) => {
    return resolver({}, args, dummyContext({ user }));
  };

  describe("Authorization", () => {
    const allows = [context.admin, context.alice];

    const denies = [context.guest];

    test.each(allows)("allows %#", user => {
      void expect(resolve({ user })).resolves.not.toThrow(AuthErr);
    });

    test.each(denies)("denies %#", user => {
      void expect(resolve({ user })).rejects.toThrow(AuthErr);
    });
  });

  describe("Parsing", () => {
    const validInput = valid.args.input;

    const valids = [
      { ...validInput },
      { ...validInput, title: "A".repeat(TITLE_MAX) },
      { ...validInput, title: "🅰".repeat(TITLE_MAX) },
      { ...validInput, description: "A".repeat(DESC_MAX) },
      { ...validInput, description: "🅰".repeat(DESC_MAX) },
    ] as Args["input"][];

    const invalids = [
      { ...validInput, title: "A".repeat(TITLE_MAX + 1) },
      { ...validInput, title: "🅰".repeat(TITLE_MAX + 1) },
      { ...validInput, description: "A".repeat(DESC_MAX + 1) },
      { ...validInput, description: "🅰".repeat(DESC_MAX + 1) },
    ] as Args["input"][];

    test.each(valids)("valids %#", input => {
      void expect(resolve({ args: { input } })).resolves.not.toThrow(ParseErr);
    });

    test.each(invalids)("invalids %#", input => {
      void expect(resolve({ args: { input } })).rejects.toThrow(ParseErr);
    });
  });
}
