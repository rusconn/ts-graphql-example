import bcrypt from "bcrypt";
import { ulid } from "ulid";

import { passwordHashRoundsExponent } from "@/config.js";
import * as Prisma from "@/prisma/mod.js";
import { isGuest } from "../common/authorizers.js";
import { ParseError } from "../common/parsers.js";
import type { MutationResolvers, MutationSignupArgs } from "../common/schema.js";
import { userNodeId } from "./common/adapter.js";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    signup(input: SignupInput!): SignupResult
  }

  input SignupInput {
    "100文字まで"
    name: NonEmptyString!
    "100文字まで、既に存在する場合はエラー"
    email: EmailAddress!
    "8文字以上、50文字まで"
    password: NonEmptyString!
  }

  union SignupResult = SignupSuccess | EmailAlreadyTakenError

  type SignupSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["signup"] = async (_parent, args, context) => {
  const authed = authorizer(context.user);

  const { password, ...data } = parser(args);

  try {
    const hashed = await bcrypt.hash(password, passwordHashRoundsExponent);

    const created = await context.prisma.user.create({
      data: {
        id: authed.id,
        password: hashed,
        token: ulid(),
        ...data,
      },
      select: { id: true },
    });

    return {
      __typename: "SignupSuccess",
      id: adapter(created.id),
    };
  } catch (e) {
    // ほぼ確実に email の衝突
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

const authorizer = isGuest;

const parser = (args: MutationSignupArgs) => {
  const { name, email, password } = args.input;

  if ([...name].length > 100) {
    throw new ParseError("`name` must be up to 100 characteres");
  }
  if ([...email].length > 100) {
    throw new ParseError("`email` must be up to 100 characteres");
  }
  if ([...password].length < 8) {
    throw new ParseError("`password` must be at least 8 characteres");
  }
  if ([...password].length > 50) {
    throw new ParseError("`password` must be up to 50 characteres");
  }

  return { name, email, password, role: Prisma.Role.USER };
};

const adapter = userNodeId;

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.js");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.js");
  const { ParseError: ParseErr } = await import("../common/parsers.js");

  describe("Authorization", () => {
    const allow = [guest];

    const deny = [admin, alice];

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

    const validInput = { name: "name", email: "email@email.com", password: "password" };

    const valid = [
      { ...validInput },
      { ...validInput, name: "A".repeat(nameMax) },
      { ...validInput, name: "🅰".repeat(nameMax) },
      { ...validInput, email: `${"A".repeat(emailMax - 10)}@email.com` },
      { ...validInput, email: `${"🅰".repeat(emailMax - 10)}@email.com` },
      { ...validInput, password: "A".repeat(passMin) },
      { ...validInput, password: "🅰".repeat(passMax) },
    ] as MutationSignupArgs["input"][];

    const invalid = [
      { ...validInput, name: "A".repeat(nameMax + 1) },
      { ...validInput, name: "🅰".repeat(nameMax + 1) },
      { ...validInput, email: `${"A".repeat(emailMax - 10 + 1)}@email.com` },
      { ...validInput, email: `${"🅰".repeat(emailMax - 10 + 1)}@email.com` },
      { ...validInput, password: "A".repeat(passMin - 1) },
      { ...validInput, password: "🅰".repeat(passMax + 1) },
    ] as MutationSignupArgs["input"][];

    test.each(valid)("valid %#", input => {
      expect(() => parser({ input })).not.toThrow(ParseErr);
    });

    test.each(invalid)("invalid %#", input => {
      expect(() => parser({ input })).toThrow(ParseErr);
    });
  });
}
