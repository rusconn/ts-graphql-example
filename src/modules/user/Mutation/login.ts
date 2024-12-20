import bcrypt from "bcrypt";
import { v7 as uuidv7 } from "uuid";

import type { MutationLoginArgs, MutationResolvers } from "../../../schema.ts";
import { auth } from "../../common/authorizers.ts";
import { numChars, parseErr } from "../../common/parsers.ts";
import { isEmail } from "../common/parser.ts";

const EMAIL_MAX = 100;
const PASS_MIN = 8;
const PASS_MAX = 50;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    login(input: LoginInput!): LoginResult
  }

  input LoginInput {
    "${EMAIL_MAX}文字まで"
    email: NonEmptyString!
    "${PASS_MIN}文字以上、${PASS_MAX}文字まで"
    password: NonEmptyString!
  }

  union LoginResult = LoginSuccess | UserNotFoundError

  type LoginSuccess {
    token: NonEmptyString!
  }

  type UserNotFoundError implements Error {
    message: String!
  }
`;

export const resolver: MutationResolvers["login"] = async (_parent, args, context) => {
  auth(context);

  const { email, password } = parseArgs(args);

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

  const token = uuidv7();

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
  const { email, password } = args.input;

  if (numChars(email) > EMAIL_MAX) {
    throw parseErr(`"email" must be up to ${EMAIL_MAX} characters`);
  }
  if (!isEmail(email)) {
    throw parseErr(`invalid "email"`);
  }
  if (numChars(password) < PASS_MIN) {
    throw parseErr(`"password" must be at least ${PASS_MIN} characters`);
  }
  if (numChars(password) > PASS_MAX) {
    throw parseErr(`"password" must be up to ${PASS_MAX} characters`);
  }

  return { email, password };
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../../schema.ts");

  describe("Parsing", () => {
    const validInput = { email: "email@email.com", password: "password" };

    const valids = [
      { ...validInput },
      { ...validInput, email: `${"A".repeat(EMAIL_MAX - 10)}@email.com` },
      { ...validInput, password: "A".repeat(PASS_MIN) },
    ] as MutationLoginArgs["input"][];

    const invalids = [
      { ...validInput, email: `${"A".repeat(EMAIL_MAX - 10 + 1)}@email.com` },
      { ...validInput, password: "A".repeat(PASS_MIN - 1) },
      { ...validInput, email: "emailemail.com" },
    ] as MutationLoginArgs["input"][];

    test.each(valids)("valids %#", (input) => {
      parseArgs({ input });
    });

    test.each(invalids)("invalids %#", (input) => {
      expect.assertions(1);
      try {
        parseArgs({ input });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
      }
    });
  });
}
