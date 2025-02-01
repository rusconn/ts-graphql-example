import * as UserPassword from "../../models/user/password.ts";
import type { MutationLoginArgs, MutationResolvers } from "../../schema.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { USER_EMAIL_MAX, parseUserEmail } from "../_parsers/user/email.ts";
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
      ${USER_EMAIL_MAX}文字まで
      """
      email: String!

      """
      ${USER_PASSWORD_MIN}文字以上、${USER_PASSWORD_MAX}文字まで
      """
      password: String!
    ): LoginResult
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

  const { email, password } = parsed;

  const found = await context.api.user.getWithCredencialByEmail(email);

  if (!found) {
    return {
      __typename: "LoginFailedError",
      message: "Incorrect email or password.",
    };
  }

  const match = await UserPassword.match(password, found.password);

  if (!match) {
    return {
      __typename: "LoginFailedError",
      message: "Incorrect email or password.",
    };
  }

  const updated = await context.api.user.updateTokenById(found.id);

  if (!updated) {
    throw internalServerError();
  }

  return {
    __typename: "LoginSuccess",
    token: updated,
  };
};

const parseArgs = (args: MutationLoginArgs) => {
  const email = parseUserEmail(args.email, "email", {
    optional: false,
    nullable: false,
  });
  const password = parseUserPassword(args.password, "password", {
    optional: false,
    nullable: false,
  });

  if (
    email instanceof ParseErr || //
    password instanceof ParseErr
  ) {
    const errors = [];

    if (email instanceof ParseErr) {
      errors.push(email);
    }
    if (password instanceof ParseErr) {
      errors.push(password);
    }

    return errors;
  } else {
    return { email, password };
  }
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const validArgs: MutationLoginArgs = {
      email: "email@email.com",
      password: "password",
    };

    const invalidArgs: MutationLoginArgs = {
      email: `${"A".repeat(USER_EMAIL_MAX - 10 + 1)}@email.com`,
      password: "A".repeat(USER_PASSWORD_MIN - 1),
    };

    const valids: MutationLoginArgs[] = [
      { ...validArgs },
      { ...validArgs, email: `${"A".repeat(USER_EMAIL_MAX - 10)}@email.com` },
      { ...validArgs, password: "A".repeat(USER_PASSWORD_MIN) },
    ];

    const invalids: [MutationLoginArgs, (keyof MutationLoginArgs)[]][] = [
      [{ ...validArgs, email: invalidArgs.email }, ["email"]],
      [{ ...validArgs, password: invalidArgs.password }, ["password"]],
      [{ ...validArgs, email: "emailemail.com" }, ["email"]],
      [{ ...validArgs, ...invalidArgs }, ["email", "password"]],
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
