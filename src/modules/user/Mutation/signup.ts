import bcrypt from "bcrypt";

import { passHashExp } from "../../../config.ts";
import { UserRole } from "../../../db/types.ts";
import * as uuidv7 from "../../../lib/uuid/v7.ts";
import type { MutationResolvers, MutationSignupArgs } from "../../../schema.ts";
import { authGuest } from "../../common/authorizers/guest.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { USER_EMAIL_MAX, parseUserEmail } from "../parsers/email.ts";
import { USER_NAME_MAX, parseUserName } from "../parsers/name.ts";
import { USER_PASSWORD_MAX, USER_PASSWORD_MIN, parseUserPassword } from "../parsers/password.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    signup(
      """
      ${USER_NAME_MAX}文字まで
      """
      name: NonEmptyString!

      """
      ${USER_EMAIL_MAX}文字まで、既に存在する場合はエラー
      """
      email: NonEmptyString!

      """
      ${USER_PASSWORD_MIN}文字以上、${USER_PASSWORD_MAX}文字まで
      """
      password: NonEmptyString!
    ): SignupResult
  }

  union SignupResult = SignupSuccess | InvalidInputError | EmailAlreadyTakenError

  type SignupSuccess {
    token: NonEmptyString!
  }
`;

export const resolver: MutationResolvers["signup"] = async (_parent, args, context) => {
  const authed = authGuest(context);

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

  const hashed = await bcrypt.hash(password, passHashExp);
  const { id, date } = uuidv7.genWithDate();
  const token = uuidv7.gen();

  await context.db
    .insertInto("User")
    .values({
      id,
      updatedAt: date,
      name,
      email,
      password: hashed,
      role: UserRole.USER,
      token,
    })
    .returning("token")
    .executeTakeFirstOrThrow();

  return {
    __typename: "SignupSuccess",
    token,
  };
};

const parseArgs = (args: MutationSignupArgs) => {
  const name = parseUserName(args, {
    optional: false,
    nullable: false,
  });

  if (name instanceof Error) {
    return name;
  }

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

  return { name, email, password };
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const validInput = { name: "name", email: "email@email.com", password: "password" };

    const valids = [
      { ...validInput },
      { ...validInput, name: "A".repeat(USER_NAME_MAX) },
      { ...validInput, email: `${"A".repeat(USER_EMAIL_MAX - 10)}@email.com` },
      { ...validInput, password: "A".repeat(USER_PASSWORD_MIN) },
    ] as MutationSignupArgs[];

    const invalids = [
      { ...validInput, name: "A".repeat(USER_NAME_MAX + 1) },
      { ...validInput, email: `${"A".repeat(USER_EMAIL_MAX - 10 + 1)}@email.com` },
      { ...validInput, password: "A".repeat(USER_PASSWORD_MIN - 1) },
      { ...validInput, email: "emailemail.com" },
    ] as MutationSignupArgs[];

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
