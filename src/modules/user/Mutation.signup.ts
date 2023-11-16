import bcrypt from "bcrypt";
import { ulid } from "ulid";

import { passwordHashRoundsExponent } from "@/config.ts";
import * as Prisma from "@/prisma/mod.ts";
import { authGuest } from "../common/authorizers.ts";
import { ParseError } from "../common/parsers.ts";
import type { MutationResolvers } from "../common/schema.ts";
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
  const authed = authGuest(context.user);

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

  try {
    const hashed = await bcrypt.hash(password, passwordHashRoundsExponent);

    const created = await context.prisma.user.create({
      data: {
        id: authed.id,
        name,
        email,
        password: hashed,
        role: Prisma.Role.USER,
        token: ulid(),
      },
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

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");
  const { ParseError: ParseErr } = await import("../common/parsers.ts");
  const { dummyContext } = await import("../common/tests.ts");

  type Args = Parameters<typeof resolver>[1];
  type Params = Parameters<typeof dummyContext>[0];

  const valid = {
    args: { input: { name: "name", email: "email@email.com", password: "password" } } as Args,
    user: guest,
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
    const allows = [guest];

    const denys = [admin, alice];

    test.each(allows)("allows %#", user => {
      void expect(resolve({ user })).resolves.not.toThrow(AuthErr);
    });

    test.each(denys)("denys %#", user => {
      void expect(resolve({ user })).rejects.toThrow(AuthErr);
    });
  });

  describe("Parsing", () => {
    const validInput = valid.args.input;

    const valids = [
      { ...validInput },
      { ...validInput, name: "A".repeat(NAME_MAX) },
      { ...validInput, name: "🅰".repeat(NAME_MAX) },
      { ...validInput, email: `${"A".repeat(EMAIL_MAX - 10)}@email.com` },
      { ...validInput, email: `${"🅰".repeat(EMAIL_MAX - 10)}@email.com` },
      { ...validInput, password: "A".repeat(PASS_MIN) },
      { ...validInput, password: "🅰".repeat(PASS_MAX) },
    ] as Args["input"][];

    const invalids = [
      { ...validInput, name: "A".repeat(NAME_MAX + 1) },
      { ...validInput, name: "🅰".repeat(NAME_MAX + 1) },
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
