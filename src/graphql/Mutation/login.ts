import { Result } from "neverthrow";

import { RefreshToken, User } from "../../domain/models.ts";
import type { MutationLoginArgs, MutationResolvers } from "../_schema.ts";
import { signedJwt } from "../../util/accessToken.ts";
import { setRefreshTokenCookie } from "../../util/refreshToken.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { invalidInputErrors } from "../_parsers/shared/errors.ts";
import { parseUserEmail } from "../_parsers/user/email.ts";
import { parseUserPassword } from "../_parsers/user/password.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    login(
      """
      ${User.Email.MAX}文字まで
      """
      email: String!

      """
      ${User.Password.MIN}文字以上、${User.Password.MAX}文字まで
      """
      password: String!
    ): LoginResult @semanticNonNull @complexity(value: 100)
  }

  union LoginResult = LoginSuccess | InvalidInputErrors | LoginFailedError

  type LoginSuccess {
    token: String!
  }

  type LoginFailedError implements Error {
    message: String!
  }
`;

export const resolver: MutationResolvers["login"] = async (_parent, args, context) => {
  const parsed = parseArgs(args);
  if (parsed.isErr()) {
    return invalidInputErrors(parsed.error);
  }

  const { email, password } = parsed.value;

  const credential = await context.queries.credential.findByEmail(email);
  if (!credential) {
    return {
      __typename: "LoginFailedError",
      message: "Incorrect email or password.",
    };
  }

  const match = await User.Password.match(password, credential.password);
  if (!match) {
    return {
      __typename: "LoginFailedError",
      message: "Incorrect email or password.",
    };
  }

  const { rawRefreshToken, refreshToken } = await RefreshToken.create(credential.userId);
  try {
    await context.kysely.transaction().execute(async (trx) => {
      await context.repos.refreshToken.add(refreshToken, trx);
      await context.repos.refreshToken.retainLatest(
        credential.userId,
        RefreshToken.MAX_RETENTION,
        trx,
      );
    });
  } catch (e) {
    throw internalServerError(e);
  }

  await setRefreshTokenCookie(context.request, rawRefreshToken);

  return {
    __typename: "LoginSuccess",
    token: await signedJwt({ id: credential.userId }),
  };
};

const parseArgs = (args: MutationLoginArgs) => {
  return Result.combineWithAllErrors([
    parseUserEmail(args, "email", {
      optional: false,
      nullable: false,
    }),
    parseUserPassword(args, "password", {
      optional: false,
      nullable: false,
    }),
  ]).map(([email, password]) => ({
    email,
    password,
  }));
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const validArgs: MutationLoginArgs = {
      email: "email@example.com",
      password: "password",
    };

    const invalidArgs: MutationLoginArgs = {
      email: `${"A".repeat(User.Email.MAX - 12 + 1)}@example.com`,
      password: "A".repeat(User.Password.MIN - 1),
    };

    const valids: MutationLoginArgs[] = [
      { ...validArgs },
      { ...validArgs, email: `${"A".repeat(User.Email.MAX - 12)}@example.com` },
      { ...validArgs, password: "A".repeat(User.Password.MIN) },
    ];

    const invalids: [MutationLoginArgs, (keyof MutationLoginArgs)[]][] = [
      [{ ...validArgs, email: invalidArgs.email }, ["email"]],
      [{ ...validArgs, password: invalidArgs.password }, ["password"]],
      [{ ...validArgs, email: "emailexample.com" }, ["email"]],
      [{ ...validArgs, ...invalidArgs }, ["email", "password"]],
    ];

    test.each(valids)("valids %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed.isOk()).toBe(true);
    });

    test.each(invalids)("invalids %#", (args, fields) => {
      const parsed = parseArgs(args);
      expect(parsed.isErr()).toBe(true);
      expect(parsed._unsafeUnwrapErr().map((e) => e.field)).toStrictEqual(fields);
    });
  });
}
