import bcrypt from "bcrypt";
import { ulid } from "ulid";

import { passwordHashRoundsExponent } from "@/config.ts";
import * as Prisma from "@/prisma/mod.ts";
import { isGuest } from "../common/authorizers.ts";
import { ParseError } from "../common/parsers.ts";
import type { MutationResolvers, MutationSignupArgs } from "../common/schema.ts";
import { userNodeId } from "./common/adapter.ts";

const NAME_MAX = 100;
const EMAIL_MAX = 100;
const PASS_MIN = 8;
const PASS_MAX = 50;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    signup(input: SignupInput!): SignupResult
  }

  input SignupInput {
    "${NAME_MAX}文字まで"
    name: NonEmptyString!
    "${EMAIL_MAX}文字まで、既に存在する場合はエラー"
    email: EmailAddress!
    "${PASS_MIN}文字以上、${PASS_MAX}文字まで"
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
      data: { id: authed.id, password: hashed, token: ulid(), ...data },
      select: { id: true },
    });

    return {
      __typename: "SignupSuccess",
      id: userNodeId(created.id),
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

  if ([...name].length > NAME_MAX) {
    throw new ParseError(`"name" must be up to ${NAME_MAX} characteres`);
  }
  if ([...email].length > EMAIL_MAX) {
    throw new ParseError(`"email" must be up to ${EMAIL_MAX} characteres`);
  }
  if ([...password].length < PASS_MIN) {
    throw new ParseError(`"password" must be at least ${PASS_MIN} characteres`);
  }
  if ([...password].length > PASS_MAX) {
    throw new ParseError(`"password" must be up to ${PASS_MAX} characteres`);
  }

  return { name, email, password, role: Prisma.Role.USER };
};

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");
  const { ParseError: ParseErr } = await import("../common/parsers.ts");

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
    const validInput = { name: "name", email: "email@email.com", password: "password" };

    const valid = [
      { ...validInput },
      { ...validInput, name: "A".repeat(NAME_MAX) },
      { ...validInput, name: "🅰".repeat(NAME_MAX) },
      { ...validInput, email: `${"A".repeat(EMAIL_MAX - 10)}@email.com` },
      { ...validInput, email: `${"🅰".repeat(EMAIL_MAX - 10)}@email.com` },
      { ...validInput, password: "A".repeat(PASS_MIN) },
      { ...validInput, password: "🅰".repeat(PASS_MAX) },
    ] as MutationSignupArgs["input"][];

    const invalid = [
      { ...validInput, name: "A".repeat(NAME_MAX + 1) },
      { ...validInput, name: "🅰".repeat(NAME_MAX + 1) },
      { ...validInput, email: `${"A".repeat(EMAIL_MAX - 10 + 1)}@email.com` },
      { ...validInput, email: `${"🅰".repeat(EMAIL_MAX - 10 + 1)}@email.com` },
      { ...validInput, password: "A".repeat(PASS_MIN - 1) },
      { ...validInput, password: "🅰".repeat(PASS_MAX + 1) },
    ] as MutationSignupArgs["input"][];

    test.each(valid)("valid %#", input => {
      expect(() => parser({ input })).not.toThrow(ParseErr);
    });

    test.each(invalid)("invalid %#", input => {
      expect(() => parser({ input })).toThrow(ParseErr);
    });
  });
}
