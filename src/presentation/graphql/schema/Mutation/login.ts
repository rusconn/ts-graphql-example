import { Result } from "neverthrow";

import { login } from "../../../../application/usecases/login.ts";
import { User } from "../../../../domain/entities.ts";
import * as AccessToken from "../../../_shared/auth/access-token.ts";
import * as RefreshTokenCookie from "../../../_shared/auth/refresh-token-cookie.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { invalidInputErrors } from "../_errors/user/invalid-input.ts";
import { parseUserEmail } from "../_parsers/user/email.ts";
import { parseUserPassword } from "../_parsers/user/password.ts";
import type { MutationLoginArgs, MutationResolvers } from "../_types.ts";

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

  const result = await login(context, parsed.value);
  switch (result.type) {
    case "UserNotFound":
    case "IncorrectPassword":
      return {
        __typename: "LoginFailedError",
        message: "Incorrect email or password.",
      };
    case "TransactionFailed":
      throw internalServerError(result.cause);
    case "Success":
      await RefreshTokenCookie.set(context, {
        value: result.rawRefreshToken,
        expires: result.refreshToken.expiresAt,
      });
      return {
        __typename: "LoginSuccess",
        token: await AccessToken.sign({
          id: result.refreshToken.userId,
        }),
      };
    default:
      throw new Error(result satisfies never);
  }
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
  describe("parsing", () => {
    const validArgs: MutationLoginArgs = {
      email: "email@example.com",
      password: "password",
    };

    const invalidArgs: MutationLoginArgs = {
      email: `${"a".repeat(User.Email.MAX - 12 + 1)}@example.com`,
      password: "a".repeat(User.Password.MIN - 1),
    };

    const valids: MutationLoginArgs[] = [
      { ...validArgs },
      { ...validArgs, email: `${"a".repeat(User.Email.MAX - 12)}@example.com` },
      { ...validArgs, password: "a".repeat(User.Password.MIN) },
    ];

    const invalids: [MutationLoginArgs, (keyof MutationLoginArgs)[]][] = [
      [{ ...validArgs, email: invalidArgs.email }, ["email"]],
      [{ ...validArgs, password: invalidArgs.password }, ["password"]],
      [{ ...validArgs, email: "emailexample.com" }, ["email"]],
      [{ ...validArgs, ...invalidArgs }, ["email", "password"]],
    ];

    it.each(valids)("succeeds when args is valid: %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed.isOk()).toBe(true);
    });

    it.each(invalids)("failes when args is invalid: %#", (args, fields) => {
      const parsed = parseArgs(args);
      expect(parsed.isErr()).toBe(true);
      expect(parsed._unsafeUnwrapErr().map((e) => e.field)).toStrictEqual(fields);
    });
  });
}
