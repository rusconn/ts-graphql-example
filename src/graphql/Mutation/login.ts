import * as UserPassword from "../../models/user/password.ts";
import type { MutationLoginArgs, MutationResolvers } from "../../schema.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { USER_LOGIN_ID_MAX, parseUserLoginId } from "../_parsers/user/loginId.ts";
import {
  USER_PASSWORD_MAX,
  USER_PASSWORD_MIN,
  parseUserPassword,
} from "../_parsers/user/password.ts";
import { ParseErr, invalidInputErrors } from "../_parsers/util.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    login(
      """
      ユーザー名もしくはメールアドレス、${USER_LOGIN_ID_MAX}文字まで
      """
      loginId: String!

      """
      ${USER_PASSWORD_MIN}文字以上、${USER_PASSWORD_MAX}文字まで
      """
      password: String!
    ): LoginResult @semanticNonNull
  }

  union LoginResult = LoginSuccess | InvalidInputErrors | LoginFailedError

  type LoginSuccess {
    token: String!
  }

  type LoginFailedError implements Error {
    message: String!
  }
`;

export const resolver: MutationResolvers["login"] = async (_parent, args, context) => {
  const parsed = parseArgs(args);

  if (Array.isArray(parsed)) {
    return invalidInputErrors(parsed);
  }

  const { loginId, password } = parsed;
  const { type, nameOrEmail } = loginId;

  const found =
    type === "name"
      ? await context.api.user.getWithCredencialByName(nameOrEmail)
      : await context.api.user.getWithCredencialByEmail(nameOrEmail);

  if (!found) {
    return {
      __typename: "LoginFailedError",
      message: "Incorrect loginId or password.",
    };
  }

  const match = await UserPassword.match(password, found.password);

  if (!match) {
    return {
      __typename: "LoginFailedError",
      message: "Incorrect loginId or password.",
    };
  }

  const token = await context.api.user.updateTokenById(found.id);

  if (!token) {
    throw internalServerError();
  }

  return {
    __typename: "LoginSuccess",
    token,
  };
};

const parseArgs = (args: MutationLoginArgs) => {
  const loginId = parseUserLoginId(args.loginId, "loginId", {
    optional: false,
    nullable: false,
  });

  const password = parseUserPassword(args.password, "password", {
    optional: false,
    nullable: false,
  });

  if (
    loginId instanceof ParseErr || //
    password instanceof ParseErr
  ) {
    const errors = [];

    if (loginId instanceof ParseErr) {
      errors.push(loginId);
    }
    if (password instanceof ParseErr) {
      errors.push(password);
    }

    return errors;
  } else {
    return { loginId, password };
  }
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const validArgs: MutationLoginArgs = {
      loginId: "test_test",
      password: "password",
    };

    const invalidArgs: MutationLoginArgs = {
      loginId: `${"A".repeat(USER_LOGIN_ID_MAX - 10 + 1)}@email.com`,
      password: "A".repeat(USER_PASSWORD_MIN - 1),
    };

    const valids: MutationLoginArgs[] = [
      { ...validArgs },
      { ...validArgs, loginId: `${"A".repeat(USER_LOGIN_ID_MAX - 10)}@email.com` },
      { ...validArgs, password: "A".repeat(USER_PASSWORD_MIN) },
    ];

    const invalids: [MutationLoginArgs, (keyof MutationLoginArgs)[]][] = [
      [{ ...validArgs, loginId: invalidArgs.loginId }, ["loginId"]],
      [{ ...validArgs, password: invalidArgs.password }, ["password"]],
      [{ ...validArgs, loginId: "test-test" }, ["loginId"]],
      [{ ...validArgs, loginId: "emailemail.com" }, ["loginId"]],
      [
        { ...validArgs, loginId: invalidArgs.loginId, password: invalidArgs.password },
        ["loginId", "password"],
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
