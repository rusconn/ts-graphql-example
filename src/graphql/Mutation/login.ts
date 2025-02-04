import * as UserPassword from "../../db/models/user/password.ts";
import * as UserToken from "../../db/models/user/token.ts";
import type { MutationLoginArgs, MutationResolvers } from "../../schema.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { USER_EMAIL_MAX, parseUserEmail } from "../_parsers/user/email.ts";
import {
  USER_PASSWORD_MAX,
  USER_PASSWORD_MIN,
  parseUserPassword,
} from "../_parsers/user/password.ts";

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

  union LoginResult = LoginSuccess | InvalidInputError | LoginFailedError

  type LoginSuccess {
    token: String!
  }

  type LoginFailedError implements Error {
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

  const found = await context.api.user.getByEmail(email);

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

  const updated = await context.api.user.updateByEmail(email, {
    token: UserToken.gen(),
  });

  if (!updated) {
    throw internalServerError();
  }

  return {
    __typename: "LoginSuccess",
    token: updated.token!,
  };
};

const parseArgs = (args: MutationLoginArgs) => {
  const email = parseUserEmail(args.email, "email", {
    optional: false,
    nullable: false,
  });

  if (email instanceof Error) {
    return email;
  }

  const password = parseUserPassword(args.password, "password", {
    optional: false,
    nullable: false,
  });

  if (password instanceof Error) {
    return password;
  }

  return { email, password };
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const validArgs = { email: "email@email.com", password: "password" };

    const valids = [
      { ...validArgs },
      { ...validArgs, email: `${"A".repeat(USER_EMAIL_MAX - 10)}@email.com` },
      { ...validArgs, password: "A".repeat(USER_PASSWORD_MIN) },
    ] as MutationLoginArgs[];

    const invalids = [
      { ...validArgs, email: `${"A".repeat(USER_EMAIL_MAX - 10 + 1)}@email.com` },
      { ...validArgs, password: "A".repeat(USER_PASSWORD_MIN - 1) },
      { ...validArgs, email: "emailemail.com" },
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
