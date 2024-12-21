import bcrypt from "bcrypt";

import * as uuidv7 from "../../../lib/uuidv7.ts";
import type { MutationLoginArgs, MutationResolvers } from "../../../schema.ts";
import { numChars, parseErr } from "../../common/parsers.ts";
import { isEmail, isName } from "../common/parser.ts";
import * as signup from "./signup.ts";

const LOGIN_ID_MAX = Math.max(signup.NAME_MAX, signup.EMAIL_MAX);

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    login(
      """
      ユーザー名もしくはメールアドレス、${LOGIN_ID_MAX}文字まで
      """
      # name と email はフォーマットが異なるので両方に該当することはない
      loginId: NonEmptyString!

      """
      ${signup.PASS_MIN}文字以上、${signup.PASS_MAX}文字まで
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

  const token = uuidv7.gen();

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
  const { loginId, password } = args;

  if (!isName(loginId) && !isEmail(loginId)) {
    return parseErr(`"loginId" must be name or email`);
  }
  if (numChars(loginId) > LOGIN_ID_MAX) {
    return parseErr(`"loginId" must be up to ${LOGIN_ID_MAX} characters`);
  }
  if (numChars(password) < signup.PASS_MIN) {
    return parseErr(`"password" must be at least ${signup.PASS_MIN} characters`);
  }
  if (numChars(password) > signup.PASS_MAX) {
    return parseErr(`"password" must be up to ${signup.PASS_MAX} characters`);
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
      { ...validArgs, loginId: `${"A".repeat(LOGIN_ID_MAX - 10)}@email.com` },
      { ...validArgs, password: "A".repeat(signup.PASS_MIN) },
    ] as MutationLoginArgs[];

    const invalids = [
      { ...validArgs, loginId: `${"A".repeat(signup.EMAIL_MAX - 10 + 1)}@email.com` },
      { ...validArgs, password: "A".repeat(signup.PASS_MIN - 1) },
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
