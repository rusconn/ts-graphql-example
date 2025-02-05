import * as UserPassword from "../../db/models/user/password.ts";
import type { MutationAccountUpdateArgs, MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { USER_EMAIL_MAX, parseUserEmail } from "../_parsers/user/email.ts";
import { USER_NAME_MAX, USER_NAME_MIN, parseUserName } from "../_parsers/user/name.ts";
import {
  USER_PASSWORD_MAX,
  USER_PASSWORD_MIN,
  parseUserPassword,
} from "../_parsers/user/password.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    accountUpdate(
      """
      ${USER_NAME_MIN}文字以上、${USER_NAME_MAX}文字まで、null は入力エラー
      """
      name: String

      """
      ${USER_EMAIL_MAX}文字まで、既に存在する場合はエラー、null は入力エラー
      """
      email: String

      """
      ${USER_PASSWORD_MIN}文字以上、${USER_PASSWORD_MAX}文字まで、null は入力エラー
      """
      password: String
    ): AccountUpdateResult
  }

  union AccountUpdateResult = AccountUpdateSuccess | InvalidInputError | EmailAlreadyTakenError

  type AccountUpdateSuccess {
    user: User!
  }
`;

export const resolver: MutationResolvers["accountUpdate"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    return {
      __typename: "InvalidInputError",
      message: parsed.message,
    };
  }

  const { name, email, password } = parsed;

  if (email) {
    const found = await context.api.user.getByEmail(email);

    if (found) {
      return {
        __typename: "EmailAlreadyTakenError",
        message: "The email already taken.",
      };
    }
  }

  const updated = await context.api.user.updateById(authed.id, {
    name,
    email,
    ...(password && {
      password: await UserPassword.gen(password),
    }),
  });

  if (!updated) {
    throw internalServerError();
  }

  return {
    __typename: "AccountUpdateSuccess",
    user: updated,
  };
};

const parseArgs = (args: MutationAccountUpdateArgs) => {
  const name = parseUserName(args.name, "name", {
    optional: true,
    nullable: false,
  });

  if (name instanceof Error) {
    return name;
  }

  const email = parseUserEmail(args.email, "email", {
    optional: true,
    nullable: false,
  });

  if (email instanceof Error) {
    return email;
  }

  const password = parseUserPassword(args.password, "password", {
    optional: true,
    nullable: false,
  });

  if (password instanceof Error) {
    return password;
  }

  return { name, email, password };
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids = [
      {},
      { name: "name" },
      { email: "email@email.com" },
      { password: "password" },
      { name: "name", email: "email@email.com", password: "password" },
      { name: "A".repeat(USER_NAME_MAX) },
      { email: `${"A".repeat(USER_EMAIL_MAX - 10)}@email.com` },
      { password: "A".repeat(USER_PASSWORD_MIN) },
    ] as MutationAccountUpdateArgs[];

    const invalids = [
      { name: null },
      { email: null },
      { password: null },
      { name: "A".repeat(USER_NAME_MAX + 1) },
      { email: `${"A".repeat(USER_EMAIL_MAX - 10 + 1)}@email.com` },
      { password: "A".repeat(USER_PASSWORD_MIN - 1) },
      { email: "emailemail.com" },
    ] as MutationAccountUpdateArgs[];

    test.each(valids)("valids %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed instanceof Error).toBe(false);
    });

    test.each(invalids)("invalids %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed instanceof Error).toBe(true);
    });
  });
}
