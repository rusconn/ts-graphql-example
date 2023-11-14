import * as Prisma from "@/prisma/mod.ts";
import { isAuthenticated } from "../common/authorizers.ts";
import { ParseError } from "../common/parsers.ts";
import { full } from "../common/resolvers.ts";
import type { MutationResolvers } from "../common/schema.ts";

const NAME_MAX = 100;
const EMAIL_MAX = 100;
const PASS_MIN = 8;
const PASS_MAX = 50;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    "指定したフィールドのみ更新する"
    updateMe(input: UpdateMeInput!): UpdateMeResult
  }

  input UpdateMeInput {
    "${NAME_MAX}文字まで、null は入力エラー"
    name: NonEmptyString
    "${EMAIL_MAX}文字まで、既に存在する場合はエラー、null は入力エラー"
    email: EmailAddress
    "${PASS_MIN}文字以上、${PASS_MAX}文字まで、null は入力エラー"
    password: NonEmptyString
  }

  union UpdateMeResult = UpdateMeSuccess | EmailAlreadyTakenError

  type UpdateMeSuccess {
    user: User!
  }
`;

export const resolver: MutationResolvers["updateMe"] = async (_parent, args, context) => {
  const authed = isAuthenticated(context.user);

  const { name, email, password } = args.input;

  if (name === null) {
    throw new ParseError('"name" must be not null');
  }
  if (name && [...name].length > NAME_MAX) {
    throw new ParseError(`"name" must be up to ${NAME_MAX} characteres`);
  }
  if (email === null) {
    throw new ParseError('"email" must be not null');
  }
  if (email && [...email].length > EMAIL_MAX) {
    throw new ParseError(`"email" must be up to ${EMAIL_MAX} characteres`);
  }
  if (password === null) {
    throw new ParseError('"password" must be not null');
  }
  if (password && [...password].length < PASS_MIN) {
    throw new ParseError(`"password" must be at least ${PASS_MIN} characteres`);
  }
  if (password && [...password].length > PASS_MAX) {
    throw new ParseError(`"password" must be up to ${PASS_MAX} characteres`);
  }

  try {
    const updated = await context.prisma.user.update({
      where: { id: authed.id },
      data: { name, email, password },
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

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");
  const { ParseError: ParseErr } = await import("../common/parsers.ts");
  const { dummyContext } = await import("../common/tests.ts");

  type Args = Parameters<typeof resolver>[1];
  type Params = Parameters<typeof dummyContext>[0];

  const valid = {
    args: { input: {} },
    user: admin,
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
    const allows = [admin, alice];

    const denys = [guest];

    test.each(allows)("allows %#", user => {
      void expect(resolve({ user })).resolves.not.toThrow(AuthErr);
    });

    test.each(denys)("denys %#", user => {
      void expect(resolve({ user })).rejects.toThrow(AuthErr);
    });
  });

  describe("Parsing", () => {
    const valids = [
      {},
      { name: "name" },
      { email: "email@email.com" },
      { password: "password" },
      { name: "name", email: "email@email.com", password: "password" },
      { name: "A".repeat(NAME_MAX) },
      { name: "🅰".repeat(NAME_MAX) },
      { email: `${"A".repeat(EMAIL_MAX - 10)}@email.com` },
      { email: `${"🅰".repeat(EMAIL_MAX - 10)}@email.com` },
      { password: "A".repeat(PASS_MIN) },
      { password: "🅰".repeat(PASS_MAX) },
    ] as Args["input"][];

    const invalids = [
      { name: null },
      { email: null },
      { password: null },
      { name: "A".repeat(NAME_MAX + 1) },
      { name: "🅰".repeat(NAME_MAX + 1) },
      { email: `${"A".repeat(EMAIL_MAX - 10 + 1)}@email.com` },
      { email: `${"🅰".repeat(EMAIL_MAX - 10 + 1)}@email.com` },
      { password: "A".repeat(PASS_MIN - 1) },
      { password: "🅰".repeat(PASS_MAX + 1) },
    ] as Args["input"][];

    test.each(valids)("valids %#", input => {
      void expect(resolve({ args: { input } })).resolves.not.toThrow(ParseErr);
    });

    test.each(invalids)("invalids %#", input => {
      void expect(resolve({ args: { input } })).rejects.toThrow(ParseErr);
    });
  });
}
