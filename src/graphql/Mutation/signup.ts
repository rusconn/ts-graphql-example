import bcrypt from "bcrypt";

import { passHashExp } from "../../config.ts";
import { UserRole } from "../../db/generated/types.ts";
import * as UserToken from "../../db/models/user/token.ts";
import type { MutationResolvers, MutationSignupArgs } from "../../schema.ts";
import { authGuest } from "../_authorizers/guest.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { USER_EMAIL_MAX, parseUserEmail } from "../_parsers/user/email.ts";
import { USER_NAME_MAX, parseUserName } from "../_parsers/user/name.ts";
import {
  USER_PASSWORD_MAX,
  USER_PASSWORD_MIN,
  parseUserPassword,
} from "../_parsers/user/password.ts";

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

  const found = await context.api.user.getByEmail(email);

  if (found) {
    return {
      __typename: "EmailAlreadyTakenError",
      message: "specified email already taken",
    };
  }

  const hashed = await bcrypt.hash(password, passHashExp);
  const token = UserToken.gen();

  const signedUp = await context.api.user.create({
    name,
    email,
    password: hashed,
    role: UserRole.USER,
    token,
  });

  if (!signedUp) {
    throw internalServerError();
  }

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
    const validArgs = { name: "name", email: "email@email.com", password: "password" };

    const valids = [
      { ...validArgs },
      { ...validArgs, name: "A".repeat(USER_NAME_MAX) },
      { ...validArgs, email: `${"A".repeat(USER_EMAIL_MAX - 10)}@email.com` },
      { ...validArgs, password: "A".repeat(USER_PASSWORD_MIN) },
    ] as MutationSignupArgs[];

    const invalids = [
      { ...validArgs, name: "A".repeat(USER_NAME_MAX + 1) },
      { ...validArgs, email: `${"A".repeat(USER_EMAIL_MAX - 10 + 1)}@email.com` },
      { ...validArgs, password: "A".repeat(USER_PASSWORD_MIN - 1) },
      { ...validArgs, email: "emailemail.com" },
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
