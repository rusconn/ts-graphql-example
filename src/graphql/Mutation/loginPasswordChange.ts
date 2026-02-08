import { Result } from "neverthrow";

import { User } from "../../domain/models.ts";
import type { MutationLoginPasswordChangeArgs, MutationResolvers } from "../_schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { invalidInputErrors } from "../_parsers/shared/errors.ts";
import { parseUserPassword } from "../_parsers/user/password.ts";
import { userId } from "../User/id.ts";

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
      LoginPasswordChangeSuccess
    | InvalidInputErrors
    | SamePasswordsError
    | IncorrectOldPasswordError

  type LoginPasswordChangeSuccess {
    id: ID!
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
    throw forbiddenErr(ctx);
  }

  const parsed = parseArgs(args);
  if (parsed.isErr()) {
    return invalidInputErrors(parsed.error);
  }

  const user = await ctx.repos.user.find(ctx.user.id);
  if (!user) {
    throw internalServerError();
  }

  const { oldPassword, newPassword } = parsed.value;
  if (oldPassword === newPassword) {
    return {
      __typename: "SamePasswordsError",
      message: "The two passwords must be different.",
    };
  }

  const match = await User.Password.match(oldPassword, user.password);
  if (!match) {
    return {
      __typename: "IncorrectOldPasswordError",
      message: "The oldPassword is incorrect.",
    };
  }

  const changedUser = await User.changePassword(user, newPassword);
  try {
    await ctx.kysely.transaction().execute(async (trx) => {
      await ctx.repos.user.update(changedUser, trx);
    });
  } catch (e) {
    throw internalServerError(e);
  }

  return {
    __typename: "LoginPasswordChangeSuccess",
    id: userId(user.id),
  };
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
  describe("Parsing", () => {
    const valids: MutationLoginPasswordChangeArgs[] = [
      {
        oldPassword: "password",
        newPassword: "password2",
      },
      {
        oldPassword: "A".repeat(User.Password.MIN),
        newPassword: "B".repeat(User.Password.MIN),
      },
    ];

    const invalids: [MutationLoginPasswordChangeArgs, (keyof MutationLoginPasswordChangeArgs)[]][] =
      [
        [
          {
            oldPassword: "A".repeat(User.Password.MIN - 1),
            newPassword: "A".repeat(User.Password.MAX),
          },
          ["oldPassword"],
        ],
        [
          {
            oldPassword: "A".repeat(User.Password.MIN),
            newPassword: "A".repeat(User.Password.MAX + 1),
          },
          ["newPassword"],
        ],
        [
          {
            oldPassword: "A".repeat(User.Password.MAX + 1),
            newPassword: "A".repeat(User.Password.MIN - 1),
          },
          ["oldPassword", "newPassword"],
        ],
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
