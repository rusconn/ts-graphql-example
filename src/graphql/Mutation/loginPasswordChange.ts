import { UserPassword } from "../../domain/user.ts";
import type { MutationLoginPasswordChangeArgs, MutationResolvers } from "../../schema.ts";
import { userId } from "../_adapters/user/id.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import {
  parseUserPassword,
  USER_PASSWORD_MAX,
  USER_PASSWORD_MIN,
} from "../_parsers/user/password.ts";
import { invalidInputErrors, ParseErr } from "../_parsers/util.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    loginPasswordChange(
      """
      ${USER_PASSWORD_MIN}文字以上、${USER_PASSWORD_MAX}文字まで
      """
      oldPassword: String!

      """
      ${USER_PASSWORD_MIN}文字以上、${USER_PASSWORD_MAX}文字まで
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
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseArgs(args);

  if (Array.isArray(parsed)) {
    return invalidInputErrors(parsed);
  }

  const user = await context.repos.user.findByDbId(authed.id);
  if (!user) {
    throw internalServerError();
  }

  const { oldPassword, newPassword } = parsed;

  if (oldPassword === newPassword) {
    return {
      __typename: "SamePasswordsError",
      message: "The two passwords must be different.",
    };
  }

  const match = await UserPassword.match(oldPassword, user.password);

  if (!match) {
    return {
      __typename: "IncorrectOldPasswordError",
      message: "The oldPassword is incorrect.",
    };
  }

  const hashedPassword = await UserPassword.hash(newPassword);
  const updatedUser: typeof user = {
    ...user,
    password: hashedPassword,
    updatedAt: new Date(),
  };

  const result = await context.repos.user.save(updatedUser);

  switch (result.type) {
    case "Success":
      return {
        __typename: "LoginPasswordChangeSuccess",
        id: userId(user.id),
      };
    case "EmailAlreadyExists":
      throw internalServerError();
    case "Unknown":
      throw internalServerError(result.e);
    default:
      throw new Error(result satisfies never);
  }
};

const parseArgs = (args: MutationLoginPasswordChangeArgs) => {
  const oldPassword = parseUserPassword(args, "oldPassword", {
    optional: false,
    nullable: false,
  });
  const newPassword = parseUserPassword(args, "newPassword", {
    optional: false,
    nullable: false,
  });

  if (
    oldPassword instanceof ParseErr || //
    newPassword instanceof ParseErr
  ) {
    const errors = [];

    if (oldPassword instanceof ParseErr) {
      errors.push(oldPassword);
    }
    if (newPassword instanceof ParseErr) {
      errors.push(newPassword);
    }

    return errors;
  } else {
    return { oldPassword, newPassword };
  }
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids: MutationLoginPasswordChangeArgs[] = [
      { oldPassword: "password", newPassword: "password2" },
      { oldPassword: "A".repeat(USER_PASSWORD_MIN), newPassword: "B".repeat(USER_PASSWORD_MIN) },
    ];

    const invalids: [MutationLoginPasswordChangeArgs, (keyof MutationLoginPasswordChangeArgs)[]][] =
      [
        [
          {
            oldPassword: "A".repeat(USER_PASSWORD_MIN - 1),
            newPassword: "A".repeat(USER_PASSWORD_MAX),
          },
          ["oldPassword"],
        ],
        [
          {
            oldPassword: "A".repeat(USER_PASSWORD_MIN),
            newPassword: "A".repeat(USER_PASSWORD_MAX + 1),
          },
          ["newPassword"],
        ],
        [
          {
            oldPassword: "A".repeat(USER_PASSWORD_MAX + 1),
            newPassword: "A".repeat(USER_PASSWORD_MIN - 1),
          },
          ["oldPassword", "newPassword"],
        ],
      ];

    test.each(valids)("valids %#", (args) => {
      const parsed = parseArgs(args);
      expect(Array.isArray(parsed)).toBe(false);
    });

    test.each(invalids)("invalids %#", (args, fields) => {
      const parsed = parseArgs(args);
      expect(Array.isArray(parsed)).toBe(true);
      expect((parsed as ParseErr[]).map((e) => e.field)).toStrictEqual(fields);
    });
  });
}
