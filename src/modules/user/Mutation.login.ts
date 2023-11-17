import bcrypt from "bcrypt";
import { ulid } from "ulid";

import * as Prisma from "@/prisma/mod.ts";
import { allow } from "../common/authorizers.ts";
import { ParseError } from "../common/parsers.ts";
import { full } from "../common/resolvers.ts";
import type { MutationResolvers, MutationLoginArgs } from "../common/schema.ts";

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
    user: User!
  }

  type UserNotFoundError implements Error {
    message: String!
  }
`;

export const resolver: MutationResolvers["login"] = async (_parent, args, context) => {
  authorizer(context.user);

  const parsed = parser(args);

  try {
    const found = await context.prisma.user.findUniqueOrThrow({
      where: { email: parsed.email },
      select: { password: true },
    });

    const match = await bcrypt.compare(parsed.password, found.password);

    if (!match) {
      throw new Prisma.NotExistsError();
    }

    const updated = await context.prisma.user.update({
      where: { email: parsed.email },
      data: { token: ulid() },
    });

    return {
      __typename: "LoginSuccess",
      user: full(updated),
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

const authorizer = allow;

const parser = (args: MutationLoginArgs) => {
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

  return { email, password };
};

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");
  const { ParseError: ParseErr } = await import("../common/parsers.ts");

  describe("Authorization", () => {
    const allows = [admin, alice, guest];

    test.each(allows)("allow %#", user => {
      expect(() => authorizer(user)).not.toThrow(AuthErr);
    });
  });

  describe("Parsing", () => {
    const validInput = { email: "email@email.com", password: "password" };

    const valid = [
      { ...validInput },
      { ...validInput, email: `${"A".repeat(EMAIL_MAX - 10)}@email.com` },
      { ...validInput, email: `${"🅰".repeat(EMAIL_MAX - 10)}@email.com` },
      { ...validInput, password: "A".repeat(PASS_MIN) },
      { ...validInput, password: "🅰".repeat(PASS_MAX) },
    ] as MutationLoginArgs["input"][];

    const invalid = [
      { ...validInput, email: `${"A".repeat(EMAIL_MAX - 10 + 1)}@email.com` },
      { ...validInput, email: `${"🅰".repeat(EMAIL_MAX - 10 + 1)}@email.com` },
      { ...validInput, password: "A".repeat(PASS_MIN - 1) },
      { ...validInput, password: "🅰".repeat(PASS_MAX + 1) },
    ] as MutationLoginArgs["input"][];

    test.each(valid)("valid %#", input => {
      expect(() => parser({ input })).not.toThrow(ParseErr);
    });

    test.each(invalid)("invalid %#", input => {
      expect(() => parser({ input })).toThrow(ParseErr);
    });
  });
}
