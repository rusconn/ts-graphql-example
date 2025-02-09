import { pickDefined } from "../../lib/object/pickDefined.ts";
import { PgErrorCode, isPgError } from "../../lib/pg/error.ts";
import * as UserPassword from "../../models/user/password.ts";
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
import { ParseErr, invalidInputErrors } from "../_parsers/util.ts";

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

  union AccountUpdateResult = AccountUpdateSuccess | InvalidInputErrors | EmailAlreadyTakenError

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

  if (Array.isArray(parsed)) {
    return invalidInputErrors(parsed);
  }

  const { password, ...exceptPassword } = parsed;

  let updated;
  try {
    updated = await context.api.user.updateById(authed.id, {
      ...exceptPassword,
      ...(password != null && {
        password: await UserPassword.gen(password),
      }),
    });
  } catch (e) {
    if (!isPgError(e)) throw e;

    if (e.code === PgErrorCode.UniqueViolation) {
      return {
        __typename: "EmailAlreadyTakenError",
        message: "The email already taken.",
      };
    }

    throw e;
  }

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
  const email = parseUserEmail(args.email, "email", {
    optional: true,
    nullable: false,
  });
  const password = parseUserPassword(args.password, "password", {
    optional: true,
    nullable: false,
  });

  if (
    name instanceof ParseErr || //
    email instanceof ParseErr ||
    password instanceof ParseErr
  ) {
    const errors = [];

    if (name instanceof ParseErr) {
      errors.push(name);
    }
    if (email instanceof ParseErr) {
      errors.push(email);
    }
    if (password instanceof ParseErr) {
      errors.push(password);
    }

    return errors;
  } else {
    return pickDefined({ name, email, password });
  }
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids: MutationAccountUpdateArgs[] = [
      {},
      { name: "name" },
      { email: "email@email.com" },
      { password: "password" },
      { name: "name", email: "email@email.com", password: "password" },
      { name: "A".repeat(USER_NAME_MAX) },
      { email: `${"A".repeat(USER_EMAIL_MAX - 10)}@email.com` },
      { password: "A".repeat(USER_PASSWORD_MIN) },
    ];

    const invalids: [MutationAccountUpdateArgs, (keyof MutationAccountUpdateArgs)[]][] = [
      [{ name: null }, ["name"]],
      [{ email: null }, ["email"]],
      [{ password: null }, ["password"]],
      [{ name: "A".repeat(USER_NAME_MAX + 1) }, ["name"]],
      [{ email: `${"A".repeat(USER_EMAIL_MAX - 10 + 1)}@email.com` }, ["email"]],
      [{ password: "A".repeat(USER_PASSWORD_MIN - 1) }, ["password"]],
      [{ email: "emailemail.com" }, ["email"]],
      [{ name: null, email: null, password: null }, ["name", "email", "password"]],
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
