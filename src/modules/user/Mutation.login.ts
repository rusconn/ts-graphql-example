import bcrypt from "bcrypt";
import { ulid } from "ulid";

import * as Prisma from "@/prisma/mod.js";
import { allow } from "../common/authorizers.js";
import { ParseError } from "../common/parsers.js";
import { full } from "../common/resolvers.js";
import type { MutationResolvers, MutationLoginArgs } from "../common/schema.js";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    login(input: LoginInput!): LoginResult
  }

  input LoginInput {
    "100文字まで"
    email: EmailAddress!
    "8文字以上、50文字まで"
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

  if ([...email].length > 100) {
    throw new ParseError("`email` must be up to 100 characteres");
  }
  if ([...password].length < 8) {
    throw new ParseError("`password` must be at least 8 characteres");
  }
  if ([...password].length > 50) {
    throw new ParseError("`password` must be up to 50 characteres");
  }

  return { email, password };
};

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.js");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.js");
  const { ParseError: ParseErr } = await import("../common/parsers.js");

  describe("Authorization", () => {
    const allows = [admin, alice, guest];

    test.each(allows)("allow %#", user => {
      expect(() => authorizer(user)).not.toThrow(AuthErr);
    });
  });

  describe("Parsing", () => {
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
    ] as MutationLoginArgs["input"][];

    const invalid = [
      { ...validInput, email: `${"A".repeat(emailMax - 10 + 1)}@email.com` },
      { ...validInput, email: `${"🅰".repeat(emailMax - 10 + 1)}@email.com` },
      { ...validInput, password: "A".repeat(passMin - 1) },
      { ...validInput, password: "🅰".repeat(passMax + 1) },
    ] as MutationLoginArgs["input"][];

    test.each(valid)("valid %#", input => {
      expect(() => parser({ input })).not.toThrow(ParseErr);
    });

    test.each(invalid)("invalid %#", input => {
      expect(() => parser({ input })).toThrow(ParseErr);
    });
  });
}
