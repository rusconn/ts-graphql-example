import bcrypt from "bcrypt";

import { passHashExp } from "../../../config.ts";
import type { MutationResolvers, MutationUpdateAccountArgs } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { numChars, parseErr } from "../../common/parsers.ts";
import { forbiddenErr } from "../../common/resolvers.ts";
import { isEmail } from "../common/parser.ts";

const NAME_MAX = 100;
const EMAIL_MAX = 100;
const PASS_MIN = 8;
const PASS_MAX = 50;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    updateAccount(
      "${NAME_MAX}文字まで、null は入力エラー"
      name: NonEmptyString

      "${EMAIL_MAX}文字まで、既に存在する場合はエラー、null は入力エラー"
      email: NonEmptyString

      "${PASS_MIN}文字以上、${PASS_MAX}文字まで、null は入力エラー"
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
  const { name, email, password } = args;

  if (name === null) {
    return parseErr('"name" must be not null');
  }
  if (name && numChars(name) > NAME_MAX) {
    return parseErr(`"name" must be up to ${NAME_MAX} characters`);
  }
  if (email === null) {
    return parseErr('"email" must be not null');
  }
  if (email && numChars(email) > EMAIL_MAX) {
    return parseErr(`"email" must be up to ${EMAIL_MAX} characters`);
  }
  if (email && !isEmail(email)) {
    return parseErr(`invalid "email"`);
  }
  if (password === null) {
    return parseErr('"password" must be not null');
  }
  if (password && numChars(password) < PASS_MIN) {
    return parseErr(`"password" must be at least ${PASS_MIN} characters`);
  }
  if (password && numChars(password) > PASS_MAX) {
    return parseErr(`"password" must be up to ${PASS_MAX} characters`);
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
      { name: "A".repeat(NAME_MAX) },
      { email: `${"A".repeat(EMAIL_MAX - 10)}@email.com` },
      { password: "A".repeat(PASS_MIN) },
    ] as MutationUpdateAccountArgs[];

    const invalids = [
      { name: null },
      { email: null },
      { password: null },
      { name: "A".repeat(NAME_MAX + 1) },
      { email: `${"A".repeat(EMAIL_MAX - 10 + 1)}@email.com` },
      { password: "A".repeat(PASS_MIN - 1) },
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
