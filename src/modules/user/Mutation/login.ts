import bcrypt from "bcrypt";
import { ulid } from "ulid";

import * as Prisma from "@/prisma/mod.ts";
import { auth } from "../../common/authorizers.ts";
import { ParseError } from "../../common/parsers.ts";
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
  auth(context.user);

  const { email, password } = args.input;

  if ([...email].length > EMAIL_MAX) {
    throw new ParseError(`"email" must be up to ${EMAIL_MAX} characteres`);
  }
  if ([...password].length < PASS_MIN) {
    throw new ParseError(`"password" must be at least ${PASS_MIN} characteres`);
  }
  if ([...password].length > PASS_MAX) {
    throw new ParseError(`"password" must be up to ${PASS_MAX} characteres`);
  }

  try {
    const found = await context.prisma.user.findUniqueOrThrow({
      where: { email },
      select: { password: true },
    });

    const match = await bcrypt.compare(password, found.password);

    if (!match) {
      throw new Prisma.NotExistsError();
    }

    const updated = await context.prisma.user.update({
      where: { email },
      data: { token: ulid() },
      select: { token: true },
    });

    return {
      __typename: "LoginSuccess",
      token: updated.token!,
    };
  } catch (e) {
    if (e instanceof Prisma.NotExistsError) {
      context.logger.error(e, "error info");

      return {
        __typename: "UserNotFoundError",
        message: "user not found",
      };
    }

    throw e;
  }
};

if (import.meta.vitest) {
  const { AuthorizationError: AuthErr } = await import("../../common/authorizers.ts");
  const { ParseError: ParseErr } = await import("../../common/parsers.ts");
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
    const prisma = {
      user: { findUniqueOrThrow: async () => ({ password: args.input.password }) },
    } as unknown as Params["prisma"];

    return resolver({}, args, dummyContext({ prisma, user }));
  };

  describe("Authorization", () => {
    const allows = [context.admin, context.alice, context.guest];

    test.each(allows)("allows %#", user => {
      void expect(resolve({ user })).resolves.not.toThrow(AuthErr);
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

    test.each(valids)("valids %#", input => {
      void expect(resolve({ args: { input } })).resolves.not.toThrow(ParseErr);
    });

    test.each(invalids)("invalids %#", input => {
      void expect(resolve({ args: { input } })).rejects.toThrow(ParseErr);
    });
  });
}
