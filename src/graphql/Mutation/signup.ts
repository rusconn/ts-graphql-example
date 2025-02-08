import { UserRole } from "../../db/types.ts";
import * as UserPassword from "../../models/user/password.ts";
import * as UserToken from "../../models/user/token.ts";
import type { MutationResolvers, MutationSignupArgs } from "../../schema.ts";
import { authGuest } from "../_authorizers/guest.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { USER_EMAIL_MAX, parseUserEmail } from "../_parsers/user/email.ts";
import { USER_NAME_MAX, USER_NAME_MIN, parseUserName } from "../_parsers/user/name.ts";
import {
  USER_PASSWORD_MAX,
  USER_PASSWORD_MIN,
  parseUserPassword,
} from "../_parsers/user/password.ts";
import { ParseErr, invalidInputErrors } from "../_parsers/util.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    signup(
      """
      ${USER_NAME_MIN}文字以上、${USER_NAME_MAX}文字まで
      """
      name: String!

      """
      ${USER_EMAIL_MAX}文字まで、既に存在する場合はエラー
      """
      email: String!

      """
      ${USER_PASSWORD_MIN}文字以上、${USER_PASSWORD_MAX}文字まで
      """
      password: String!
    ): SignupResult
  }

  union SignupResult = SignupSuccess | InvalidInputErrors | EmailAlreadyTakenError

  type SignupSuccess {
    token: String!
  }
`;

export const resolver: MutationResolvers["signup"] = async (_parent, args, context) => {
  const authed = authGuest(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseArgs(args);

  if (Array.isArray(parsed)) {
    return invalidInputErrors(parsed);
  }

  const { name, email, password } = parsed;

  const found = await context.api.user.getByEmail(email);

  if (found) {
    return {
      __typename: "EmailAlreadyTakenError",
      message: "The email already taken.",
    };
  }

  const token = UserToken.gen();

  const signedUp = await context.api.user.create({
    name,
    email,
    password: await UserPassword.gen(password),
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
  const name = parseUserName(args.name, "name", {
    optional: false,
    nullable: false,
  });
  const email = parseUserEmail(args.email, "email", {
    optional: false,
    nullable: false,
  });
  const password = parseUserPassword(args.password, "password", {
    optional: false,
    nullable: false,
  });

  if (
    name instanceof ParseErr || //
    email instanceof ParseErr ||
    password instanceof ParseErr
  ) {
    const errors = [];

    if (name instanceof ParseErr) {
      errors.push(name);
    }
    if (email instanceof ParseErr) {
      errors.push(email);
    }
    if (password instanceof ParseErr) {
      errors.push(password);
    }

    return errors;
  } else {
    return { name, email, password };
  }
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const validArgs: MutationSignupArgs = {
      name: "name",
      email: "email@email.com",
      password: "password",
    };

    const invalidArgs: MutationSignupArgs = {
      name: "A".repeat(USER_NAME_MAX + 1),
      email: `${"A".repeat(USER_EMAIL_MAX - 10 + 1)}@email.com`,
      password: "A".repeat(USER_PASSWORD_MIN - 1),
    };

    const valids: MutationSignupArgs[] = [
      { ...validArgs },
      { ...validArgs, name: "A".repeat(USER_NAME_MAX) },
      { ...validArgs, email: `${"A".repeat(USER_EMAIL_MAX - 10)}@email.com` },
      { ...validArgs, password: "A".repeat(USER_PASSWORD_MIN) },
    ];

    const invalids: [MutationSignupArgs, (keyof MutationSignupArgs)[]][] = [
      [{ ...validArgs, name: invalidArgs.name }, ["name"]],
      [{ ...validArgs, email: invalidArgs.email }, ["email"]],
      [{ ...validArgs, password: invalidArgs.password }, ["password"]],
      [{ ...validArgs, ...invalidArgs }, ["name", "email", "password"]],
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
