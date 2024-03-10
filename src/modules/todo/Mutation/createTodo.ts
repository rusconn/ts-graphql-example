import { ulid } from "ulid";

import { authAuthenticated } from "../../common/authorizers.ts";
import { parseErr } from "../../common/parsers.ts";
import type { MutationResolvers } from "../../common/schema.ts";

const TODOS_MAX = 10000;
const TITLE_MAX = 100;
const DESC_MAX = 5000;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    "${TODOS_MAX}件まで"
    createTodo(input: CreateTodoInput!): CreateTodoResult
  }

  input CreateTodoInput {
    "${TITLE_MAX}文字まで"
    title: NonEmptyString!
    "${DESC_MAX}文字まで"
    description: String!
  }

  union CreateTodoResult = CreateTodoSuccess | TodoLimitExceededError

  type CreateTodoSuccess {
    todo: Todo!
  }

  type TodoLimitExceededError implements Error {
    message: String!
  }
`;

export const resolver: MutationResolvers["createTodo"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  const { title, description } = args.input;

  if ([...title].length > TITLE_MAX) {
    throw parseErr(`"title" must be up to ${TITLE_MAX} characters`);
  }
  if ([...description].length > DESC_MAX) {
    throw parseErr(`"description" must be up to ${DESC_MAX} characters`);
  }

  const count = await context.db
    .selectFrom("Todo")
    .where("userId", "=", authed.id)
    .select(({ fn }) => fn.countAll().as("count"))
    .executeTakeFirstOrThrow()
    .then(result => Number(result.count));

  if (count >= TODOS_MAX) {
    return {
      __typename: "TodoLimitExceededError",
      message: "the number of todos exceeded the limit",
    };
  }

  const now = new Date();

  const todo = await context.db
    .insertInto("Todo")
    .values({
      id: ulid(),
      createdAt: now,
      updatedAt: now,
      userId: authed.id,
      title,
      description,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return {
    __typename: "CreateTodoSuccess",
    todo,
  };
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../common/schema.ts");
  const { dummyContext } = await import("../../common/tests.ts");
  const { context } = await import("../../user/common/test.ts");

  type Args = Parameters<typeof resolver>[1];
  type Params = Parameters<typeof dummyContext>[0];

  const valid = {
    args: { input: { title: "title", description: "description" } } as Args,
    user: context.admin,
  };

  const resolve = ({
    db,
    args = valid.args,
    user = valid.user,
  }: {
    db?: Params["db"];
    args?: Args;
    user?: Params["user"];
  }) => {
    return resolver({}, args, dummyContext({ db, user }));
  };

  describe("Authorization", () => {
    const allows = [context.admin, context.alice];

    const denies = [context.guest];

    test.each(allows)("allows %#", async user => {
      await resolve({ user });
    });

    test.each(denies)("denies %#", async user => {
      expect.assertions(1);
      try {
        await resolve({ user });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.Forbidden);
      }
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

    test.each(valids)("valids %#", async input => {
      await resolve({ args: { input } });
    });

    test.each(invalids)("invalids %#", async input => {
      expect.assertions(1);
      try {
        await resolve({ args: { input } });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
      }
    });
  });

  describe("Maximum num todos", () => {
    const validInput = valid.args.input;

    const createDb = (num: number) =>
      ({
        selectFrom: () => ({
          where: () => ({
            select: () => ({
              executeTakeFirstOrThrow: async () => ({ count: num }),
            }),
          }),
        }),
        insertInto: () => ({
          values: () => ({
            returningAll: () => ({
              executeTakeFirstOrThrow: async () => {},
            }),
          }),
        }),
      }) as unknown as Params["db"];

    const notExceededs = [0, 1, TODOS_MAX - 1];
    const exceededs = [TODOS_MAX, TODOS_MAX + 1];

    test.each(notExceededs)("notExceededs %#", async num => {
      const db = createDb(num);

      await resolve({ db, args: { input: validInput } });
    });

    test.each(exceededs)("exceededs %#", async num => {
      const db = createDb(num);

      const result = await resolve({ db, args: { input: validInput } });

      expect(result?.__typename === "TodoLimitExceededError").toBe(true);
    });
  });
}
