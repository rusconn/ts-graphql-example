import bcrypt from "bcrypt";

import type { MutationLoginArgs, MutationResolvers } from "../../../schema.ts";
import * as userToken from "../internal/token.ts";
import { USER_LOGIN_ID_MAX, parseUserLoginId } from "../parsers/loginId.ts";
import { USER_PASSWORD_MAX, USER_PASSWORD_MIN, parseUserPassword } from "../parsers/password.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    login(
      """
      ユーザー名もしくはメールアドレス、${USER_LOGIN_ID_MAX}文字まで
      """
      # name と email はフォーマットが異なるので両方に該当することはない
      loginId: NonEmptyString!

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

  const { loginId, password } = parsed;

  const found = await context.db
    .selectFrom("User")
    .where((eb) =>
      eb.or([
        //
        eb("name", "=", loginId),
        eb("email", "=", loginId),
      ]),
    )
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
    .where((eb) =>
      eb.or([
        //
        eb("name", "=", loginId),
        eb("email", "=", loginId),
      ]),
    )
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
  const loginId = parseUserLoginId(args, {
    optional: false,
    nullable: false,
  });

  if (loginId instanceof Error) {
    return loginId;
  }

  const password = parseUserPassword(args, {
    optional: false,
    nullable: false,
  });

  if (password instanceof Error) {
    return password;
  }

  return { loginId, password };
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const validArgs = {
      loginId: "test_test",
      password: "password",
    };

    const valids = [
      { ...validArgs },
      { ...validArgs, loginId: `${"A".repeat(USER_LOGIN_ID_MAX - 10)}@email.com` },
      { ...validArgs, password: "A".repeat(USER_PASSWORD_MIN) },
    ] as MutationLoginArgs[];

    const invalids = [
      { ...validArgs, loginId: `${"A".repeat(USER_LOGIN_ID_MAX - 10 + 1)}@email.com` },
      { ...validArgs, password: "A".repeat(USER_PASSWORD_MIN - 1) },
      { ...validArgs, loginId: "test-test" },
      { ...validArgs, loginId: "emailemail.com" },
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
