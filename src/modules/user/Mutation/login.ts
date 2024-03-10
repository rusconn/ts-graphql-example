import bcrypt from "bcrypt";
import { ulid } from "ulid";

import { auth } from "../../common/authorizers.ts";
import { parseErr } from "../../common/parsers.ts";
import type { MutationResolvers } from "../../common/schema.ts";

const EMAIL_MAX = 100;
const PASS_MIN = 8;
const PASS_MAX = 50;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    login(input: LoginInput!): LoginResult
  }

  input LoginInput {
    "${EMAIL_MAX}文字まで"
    email: EmailAddress!
    "${PASS_MIN}文字以上、${PASS_MAX}文字まで"
    password: NonEmptyString!
  }

  union LoginResult = LoginSuccess | UserNotFoundError

  type LoginSuccess {
    token: NonEmptyString!
  }

  type UserNotFoundError implements Error {
    message: String!
  }
`;

export const resolver: MutationResolvers["login"] = async (_parent, args, context) => {
  auth(context);

  const { email, password } = args.input;

  if ([...email].length > EMAIL_MAX) {
    throw parseErr(`"email" must be up to ${EMAIL_MAX} characteres`);
  }
  if ([...password].length < PASS_MIN) {
    throw parseErr(`"password" must be at least ${PASS_MIN} characteres`);
  }
  if ([...password].length > PASS_MAX) {
    throw parseErr(`"password" must be up to ${PASS_MAX} characteres`);
  }

  const found = await context.db
    .selectFrom("User")
    .where("email", "=", email)
    .select("password")
    .executeTakeFirst();

  if (!found) {
    return {
      __typename: "UserNotFoundError",
      message: "user not found",
    };
  }

  const match = await bcrypt.compare(password, found.password);

  if (!match) {
    return {
      __typename: "UserNotFoundError",
      message: "user not found",
    };
  }

  const token = ulid();

  await context.db
    .updateTable("User")
    .where("email", "=", email)
    .set({ token })
    .returning("token")
    .executeTakeFirstOrThrow();

  return {
    __typename: "LoginSuccess",
    token,
  };
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../common/schema.ts");
  const { dummyContext } = await import("../../common/tests.ts");
  const { context } = await import("../common/test.ts");

  type Args = Parameters<typeof resolver>[1];
  type Params = Parameters<typeof dummyContext>[0];

  const valid = {
    args: { input: { email: "email@email.com", password: "password" } } as Args,
    user: context.admin,
  };

  const resolve = ({
    args = valid.args,
    user = valid.user,
  }: {
    args?: Args;
    user?: Params["user"];
  }) => {
    const db = {
      selectFrom: () => ({
        where: () => ({
          select: () => ({
            executeTakeFirst: async () => ({ password: args.input.password }),
          }),
        }),
      }),
    } as unknown as Params["db"];

    return resolver({}, args, dummyContext({ db, user }));
  };

  describe("Authorization", () => {
    const allows = [context.admin, context.alice, context.guest];

    test.each(allows)("allows %#", async user => {
      await resolve({ user });
    });
  });

  describe("Parsing", () => {
    const validInput = valid.args.input;

    const valids = [
      { ...validInput },
      { ...validInput, email: `${"A".repeat(EMAIL_MAX - 10)}@email.com` },
      { ...validInput, email: `${"🅰".repeat(EMAIL_MAX - 10)}@email.com` },
      { ...validInput, password: "A".repeat(PASS_MIN) },
      { ...validInput, password: "🅰".repeat(PASS_MAX) },
    ] as Args["input"][];

    const invalids = [
      { ...validInput, email: `${"A".repeat(EMAIL_MAX - 10 + 1)}@email.com` },
      { ...validInput, email: `${"🅰".repeat(EMAIL_MAX - 10 + 1)}@email.com` },
      { ...validInput, password: "A".repeat(PASS_MIN - 1) },
      { ...validInput, password: "🅰".repeat(PASS_MAX + 1) },
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
}
