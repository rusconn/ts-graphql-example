import bcrypt from "bcrypt";

import type { UserEmail } from "../../../db/models/user/email.ts";
import type { UserName } from "../../../db/models/user/name.ts";
import * as userToken from "../../../db/models/user/token.ts";
import type { MutationLoginArgs, MutationResolvers } from "../../../schema.ts";
import { internalServerError } from "../../common/errors/internalServerError.ts";
import { USER_LOGIN_ID_MAX, parseUserLoginId } from "../parsers/loginId.ts";
import { USER_PASSWORD_MAX, USER_PASSWORD_MIN, parseUserPassword } from "../parsers/password.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    login(
      """
      ユーザー名もしくはメールアドレス、${USER_LOGIN_ID_MAX}文字まで
      """
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
  const { type, nameOrEmail } = loginId;

  const found = await context.api.user.getByKey(type)(nameOrEmail);

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

  const loggedIn = await context.api.user.updateByKey(type)(nameOrEmail, {
    token,
  });

  if (!loggedIn) {
    throw internalServerError();
  }

  return {
    __typename: "LoginSuccess",
    token,
  };
};

const parseArgs = (args: MutationLoginArgs) => {
  const loginId = parseUserLoginId(args, {
    optional: false,
    nullable: false,
  }) as // parseUserLoginId の型パズルに敗北した
    | { type: "name"; nameOrEmail: UserName } //
    | { type: "email"; nameOrEmail: UserEmail };

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
