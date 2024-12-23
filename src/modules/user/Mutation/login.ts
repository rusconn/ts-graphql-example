import bcrypt from "bcrypt";

import type { MutationLoginArgs, MutationResolvers } from "../../../schema.ts";
import * as userToken from "../internal/token.ts";
import { USER_EMAIL_MAX, parseUserEmail } from "../parsers/email.ts";
import { USER_PASSWORD_MAX, USER_PASSWORD_MIN, parseUserPassword } from "../parsers/password.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    login(
      """
      ${USER_EMAIL_MAX}文字まで
      """
      email: NonEmptyString!

      """
      ${USER_PASSWORD_MIN}文字以上、${USER_PASSWORD_MAX}文字まで
      """
      password: NonEmptyString!
    ): LoginResult
  }

  union LoginResult = LoginSuccess | InvalidInputError | UserNotFoundError

  type LoginSuccess {
    token: NonEmptyString!
  }

  type UserNotFoundError implements Error {
    message: String!
  }
`;

export const resolver: MutationResolvers["login"] = async (_parent, args, context) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    return {
      __typename: "InvalidInputError",
      message: parsed.message,
    };
  }

  const { email, password } = parsed;

  const found = await context.db
    .selectFrom("User")
    .where("email", "=", email)
    .select("password")
    .executeTakeFirst();

  if (!found) {
    return {
      __typename: "UserNotFoundError",
      message: "user not found",
    };
  }

  const match = await bcrypt.compare(password, found.password);

  if (!match) {
    return {
      __typename: "UserNotFoundError",
      message: "user not found",
    };
  }

  const token = userToken.gen();

  await context.db
    .updateTable("User")
    .where("email", "=", email)
    .set({
      updatedAt: new Date(),
      token,
    })
    .returning("token")
    .executeTakeFirstOrThrow();

  return {
    __typename: "LoginSuccess",
    token,
  };
};

const parseArgs = (args: MutationLoginArgs) => {
  const email = parseUserEmail(args, {
    optional: false,
    nullable: false,
  });

  if (email instanceof Error) {
    return email;
  }

  const password = parseUserPassword(args, {
    optional: false,
    nullable: false,
  });

  if (password instanceof Error) {
    return password;
  }

  return { email, password };
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const validInput = { email: "email@email.com", password: "password" };

    const valids = [
      { ...validInput },
      { ...validInput, email: `${"A".repeat(USER_EMAIL_MAX - 10)}@email.com` },
      { ...validInput, password: "A".repeat(USER_PASSWORD_MIN) },
    ] as MutationLoginArgs[];

    const invalids = [
      { ...validInput, email: `${"A".repeat(USER_EMAIL_MAX - 10 + 1)}@email.com` },
      { ...validInput, password: "A".repeat(USER_PASSWORD_MIN - 1) },
      { ...validInput, email: "emailemail.com" },
    ] as MutationLoginArgs[];

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
