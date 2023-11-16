import * as Prisma from "@/prisma/mod.ts";
import { isAuthenticated } from "../common/authorizers.ts";
import { ParseError } from "../common/parsers.ts";
import { full } from "../common/resolvers.ts";
import type { MutationResolvers, MutationUpdateMeArgs } from "../common/schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    "指定したフィールドのみ更新する"
    updateMe(input: UpdateMeInput!): UpdateMeResult
  }

  input UpdateMeInput {
    "100文字まで、null は入力エラー"
    name: NonEmptyString
    "100文字まで、既に存在する場合はエラー、null は入力エラー"
    email: EmailAddress
    "8文字以上、50文字まで、null は入力エラー"
    password: NonEmptyString
  }

  union UpdateMeResult = UpdateMeSuccess | EmailAlreadyTakenError

  type UpdateMeSuccess {
    user: User!
  }
`;

export const resolver: MutationResolvers["updateMe"] = async (_parent, args, context) => {
  const authed = authorizer(context.user);

  const parsed = parser(args);

  try {
    const updated = await context.prisma.user.update({
      where: { id: authed.id },
      data: parsed,
    });

    return {
      __typename: "UpdateMeSuccess",
      user: full(updated),
    };
  } catch (e) {
    if (e instanceof Prisma.NotUniqueError) {
      context.logger.error(e, "error info");

      return {
        __typename: "EmailAlreadyTakenError",
        message: "specified email already taken",
      };
    }

    throw e;
  }
};

const authorizer = isAuthenticated;

const parser = (args: MutationUpdateMeArgs) => {
  const { name, email, password } = args.input;

  if (name === null) {
    throw new ParseError("`name` must be not null");
  }
  if (name && [...name].length > 100) {
    throw new ParseError("`name` must be up to 100 characteres");
  }
  if (email === null) {
    throw new ParseError("`email` must be not null");
  }
  if (email && [...email].length > 100) {
    throw new ParseError("`email` must be up to 100 characteres");
  }
  if (password === null) {
    throw new ParseError("`password` must be not null");
  }
  if (password && [...password].length < 8) {
    throw new ParseError("`password` must be at least 8 characteres");
  }
  if (password && [...password].length > 50) {
    throw new ParseError("`password` must be up to 50 characteres");
  }

  return { name, email, password };
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
    const nameMax = 100;
    const emailMax = 100;
    const passMin = 8;
    const passMax = 50;

    const valid = [
      { name: "name" },
      { email: "email@email.com" },
      { password: "password" },
      { name: "name", email: "email@email.com", password: "password" },
      { name: "A".repeat(nameMax) },
      { name: "🅰".repeat(nameMax) },
      { email: `${"A".repeat(emailMax - 10)}@email.com` },
      { email: `${"🅰".repeat(emailMax - 10)}@email.com` },
      { password: "A".repeat(passMin) },
      { password: "🅰".repeat(passMax) },
    ] as MutationUpdateMeArgs["input"][];

    const invalid = [
      { name: null },
      { email: null },
      { password: null },
      { name: "A".repeat(nameMax + 1) },
      { name: "🅰".repeat(nameMax + 1) },
      { email: `${"A".repeat(emailMax - 10 + 1)}@email.com` },
      { email: `${"🅰".repeat(emailMax - 10 + 1)}@email.com` },
      { password: "A".repeat(passMin - 1) },
      { password: "🅰".repeat(passMax + 1) },
    ] as MutationUpdateMeArgs["input"][];

    test.each(valid)("valid %#", input => {
      expect(() => parser({ input })).not.toThrow(ParseErr);
    });

    test.each(invalid)("invalid %#", input => {
      expect(() => parser({ input })).toThrow(ParseErr);
    });
  });
}
