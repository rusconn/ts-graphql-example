import { Result } from "neverthrow";

import { changeLoginPassword } from "../../../../application/usecases/change-login-password.ts";
import { User } from "../../../../domain/entities.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenError } from "../_errors/global/forbidden.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { invalidInputErrors } from "../_errors/user/invalid-input.ts";
import { parseUserPassword } from "../_parsers/user/password.ts";
import type { MutationLoginPasswordChangeArgs, MutationResolvers } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    loginPasswordChange(
      """
      ${User.Password.MIN}文字以上、${User.Password.MAX}文字まで
      """
      oldPassword: String!

      """
      ${User.Password.MIN}文字以上、${User.Password.MAX}文字まで
      """
      newPassword: String!
    ): LoginPasswordChangeResult @semanticNonNull @complexity(value: 100)
  }

  union LoginPasswordChangeResult =
    | LoginPasswordChangeSuccess
    | InvalidInputErrors
    | SamePasswordsError
    | IncorrectOldPasswordError

  type LoginPasswordChangeSuccess {
    user: User!
  }

  type SamePasswordsError implements Error {
    message: String!
  }

  type IncorrectOldPasswordError implements Error {
    message: String!
  }
`;

export const resolver: MutationResolvers["loginPasswordChange"] = async (
  _parent,
  args,
  context,
) => {
  const ctx = authAuthenticated(context);
  if (Error.isError(ctx)) {
    throw forbiddenError(ctx);
  }

  const parsed = parseArgs(args);
  if (parsed.isErr()) {
    return invalidInputErrors(parsed.error);
  }

  const result = await changeLoginPassword(ctx, parsed.value);
  switch (result.type) {
    case "UserEntityNotFound":
      throw internalServerError();
    case "SamePasswords":
      return {
        __typename: "SamePasswordsError",
        message: "The two passwords must be different.",
      };
    case "IncorrectOldPassword":
      return {
        __typename: "IncorrectOldPasswordError",
        message: "The oldPassword is incorrect.",
      };
    case "TransactionFailed":
      throw internalServerError(result.cause);
    case "Success":
      return {
        __typename: "LoginPasswordChangeSuccess",
        user: result.changed,
      };
    default:
      throw new Error(result satisfies never);
  }
};

const parseArgs = (args: MutationLoginPasswordChangeArgs) => {
  return Result.combineWithAllErrors([
    parseUserPassword(args, "oldPassword", {
      optional: false,
      nullable: false,
    }),
    parseUserPassword(args, "newPassword", {
      optional: false,
      nullable: false,
    }),
  ]).map(([oldPassword, newPassword]) => ({
    oldPassword,
    newPassword,
  }));
};

if (import.meta.vitest) {
  describe("parsing", () => {
    const valids: MutationLoginPasswordChangeArgs[] = [
      {
        oldPassword: "password",
        newPassword: "password2",
      },
      {
        oldPassword: "a".repeat(User.Password.MIN),
        newPassword: "b".repeat(User.Password.MIN),
      },
    ];

    const invalids: [MutationLoginPasswordChangeArgs, (keyof MutationLoginPasswordChangeArgs)[]][] =
      [
        [
          {
            oldPassword: "a".repeat(User.Password.MIN - 1),
            newPassword: "a".repeat(User.Password.MAX),
          },
          ["oldPassword"],
        ],
        [
          {
            oldPassword: "a".repeat(User.Password.MIN),
            newPassword: "a".repeat(User.Password.MAX + 1),
          },
          ["newPassword"],
        ],
        [
          {
            oldPassword: "a".repeat(User.Password.MAX + 1),
            newPassword: "a".repeat(User.Password.MIN - 1),
          },
          ["oldPassword", "newPassword"],
        ],
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
