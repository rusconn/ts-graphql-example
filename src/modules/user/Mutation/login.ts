import bcrypt from "bcrypt";

import { numChars } from "../../../lib/string/numChars.ts";
import * as uuidv7 from "../../../lib/uuidv7.ts";
import type { MutationLoginArgs, MutationResolvers } from "../../../schema.ts";
import { parseErr } from "../../common/parsers/util.ts";
import { isEmail } from "../parsers/email.ts";

const EMAIL_MAX = 100;
const PASS_MIN = 8;
const PASS_MAX = 50;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    login(
      """
      ${EMAIL_MAX}文字まで
      """
      email: NonEmptyString!

      """
      ${PASS_MIN}文字以上、${PASS_MAX}文字まで
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

  const token = uuidv7.gen();

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
  const { email, password } = args;

  if (numChars(email) > EMAIL_MAX) {
    return parseErr(`"email" must be up to ${EMAIL_MAX} characters`);
  }
  if (!isEmail(email)) {
    return parseErr(`invalid "email"`);
  }
  if (numChars(password) < PASS_MIN) {
    return parseErr(`"password" must be at least ${PASS_MIN} characters`);
  }
  if (numChars(password) > PASS_MAX) {
    return parseErr(`"password" must be up to ${PASS_MAX} characters`);
  }

  return { email, password };
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const validInput = { email: "email@email.com", password: "password" };

    const valids = [
      { ...validInput },
      { ...validInput, email: `${"A".repeat(EMAIL_MAX - 10)}@email.com` },
      { ...validInput, password: "A".repeat(PASS_MIN) },
    ] as MutationLoginArgs[];

    const invalids = [
      { ...validInput, email: `${"A".repeat(EMAIL_MAX - 10 + 1)}@email.com` },
      { ...validInput, password: "A".repeat(PASS_MIN - 1) },
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
