import { Result } from "neverthrow";

import * as Dto from "../../application/queries/dto.ts";
import { User } from "../../domain/entities.ts";
import type { ContextForAuthed } from "../../server/context.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/global/forbidden.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { invalidInputErrors } from "../_errors/user/invalid-input.ts";
import { parseUserPassword } from "../_parsers/user/password.ts";
import type { MutationLoginPasswordChangeArgs, MutationResolvers } from "../_schema.ts";

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
    throw forbiddenErr(ctx);
  }

  const parsed = parseArgs(args);
  if (parsed.isErr()) {
    return invalidInputErrors(parsed.error);
  }

  return await logic(ctx, parsed.value);
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

const logic = async (
  ctx: ContextForAuthed,
  input: Parameters<typeof User.changePassword>[1],
): Promise<ReturnType<MutationResolvers["loginPasswordChange"]>> => {
  const user = await ctx.repos.user.find(ctx.user.id);
  if (!user) {
    throw internalServerError();
  }

  const changedUser = await User.changePassword(user, input);
  if (changedUser.isErr()) {
    switch (changedUser.error) {
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
      default:
        throw new Error(changedUser.error satisfies never);
    }
  }

  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.user.update(changedUser.value);
    });
  } catch (e) {
    throw internalServerError(e);
  }

  return {
    __typename: "LoginPasswordChangeSuccess",
    user: Dto.User.fromDomain(changedUser.value),
  };
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
