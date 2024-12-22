import bcrypt from "bcrypt";

import { passHashExp } from "../../../config.ts";
import type { MutationResolvers, MutationUpdateAccountArgs } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers/authenticated.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { USER_EMAIL_MAX, parseUserEmail } from "../parsers/email.ts";
import { USER_NAME_MAX, parseUserName } from "../parsers/name.ts";
import { USER_PASSWORD_MAX, USER_PASSWORD_MIN, parseUserPassword } from "../parsers/password.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    updateAccount(
      """
      ${USER_NAME_MAX}文字まで、null は入力エラー
      """
      name: NonEmptyString

      """
      ${USER_EMAIL_MAX}文字まで、既に存在する場合はエラー、null は入力エラー
      """
      email: NonEmptyString

      """
      ${USER_PASSWORD_MIN}文字以上、${USER_PASSWORD_MAX}文字まで、null は入力エラー
      """
      password: NonEmptyString
    ): UpdateAccountResult
  }

  union UpdateAccountResult = UpdateAccountSuccess | InvalidInputError | EmailAlreadyTakenError

  type UpdateAccountSuccess {
    user: User!
  }
`;

export const resolver: MutationResolvers["updateAccount"] = async (_parent, args, context) => {
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
    const found = await context.db
      .selectFrom("User")
      .where("email", "=", email)
      .select("id")
      .executeTakeFirst();

    if (found) {
      return {
        __typename: "EmailAlreadyTakenError",
        message: "specified email already taken",
      };
    }
  }

  const hashed = password && (await bcrypt.hash(password, passHashExp));

  const updated = await context.db
    .updateTable("User")
    .where("id", "=", authed.id)
    .set({
      updatedAt: new Date(),
      name,
      email,
      password: hashed,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return {
    __typename: "UpdateAccountSuccess",
    user: updated,
  };
};

const parseArgs = (args: MutationUpdateAccountArgs) => {
  const name = parseUserName(args, {
    optional: true,
    nullable: false,
  });

  if (name instanceof Error) {
    return name;
  }

  const email = parseUserEmail(args, {
    optional: true,
    nullable: false,
  });

  if (email instanceof Error) {
    return email;
  }

  const password = parseUserPassword(args, {
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
    ] as MutationUpdateAccountArgs[];

    const invalids = [
      { name: null },
      { email: null },
      { password: null },
      { name: "A".repeat(USER_NAME_MAX + 1) },
      { email: `${"A".repeat(USER_EMAIL_MAX - 10 + 1)}@email.com` },
      { password: "A".repeat(USER_PASSWORD_MIN - 1) },
      { email: "emailemail.com" },
    ] as MutationUpdateAccountArgs[];

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
