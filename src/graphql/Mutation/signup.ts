import * as User from "../../domain/user.ts";
import * as UserToken from "../../domain/user-token.ts";
import type { MutationResolvers, MutationSignupArgs } from "../../schema.ts";
import { signedJwt } from "../../util/accessToken.ts";
import { setRefreshTokenCookie } from "../../util/refreshToken.ts";
import { authGuest } from "../_authorizers/guest.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { parseUserEmail, USER_EMAIL_MAX } from "../_parsers/user/email.ts";
import { parseUserName, USER_NAME_MAX, USER_NAME_MIN } from "../_parsers/user/name.ts";
import {
  parseUserPassword,
  USER_PASSWORD_MAX,
  USER_PASSWORD_MIN,
} from "../_parsers/user/password.ts";
import { invalidInputErrors, ParseErr } from "../_parsers/util.ts";

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
    ): SignupResult @semanticNonNull @complexity(value: 100)
  }

  union SignupResult = SignupSuccess | InvalidInputErrors | EmailAlreadyTakenError

  type SignupSuccess {
    token: String!
  }
`;

export const resolver: MutationResolvers["signup"] = async (_parent, args, context) => {
  const ctx = authGuest(context);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  const parsed = parseArgs(args);
  if (Array.isArray(parsed)) {
    return invalidInputErrors(parsed);
  }

  const user = await User.create(parsed);
  const { rawToken, userToken } = await UserToken.create(user.id);

  {
    const trx = await ctx.db.startTransaction().execute();

    const result = await ctx.repos.user.save(user, trx);
    switch (result.type) {
      case "Ok":
        break;
      case "EmailAlreadyExists":
        await trx.rollback().execute();
        return {
          __typename: "EmailAlreadyTakenError",
          message: "The email already taken.",
        };
      case "Forbidden":
      case "NotFound":
      case "Unknown":
        await trx.rollback().execute();
        throw internalServerError(result.e);
      default:
        throw new Error(result satisfies never);
    }

    const result2 = await ctx.repos.userToken.save(userToken, trx);
    switch (result2) {
      case "Ok":
        break;
      case "Forbidden":
      case "NotFound":
      case "Failed":
        await trx.rollback().execute();
        throw internalServerError(result.e);
      default:
        throw new Error(result2 satisfies never);
    }

    await trx.commit().execute();
  }

  await setRefreshTokenCookie(ctx.request, rawToken);

  return {
    __typename: "SignupSuccess",
    token: await signedJwt(user),
  };
};

const parseArgs = (args: MutationSignupArgs) => {
  const name = parseUserName(args, "name", {
    optional: false,
    nullable: false,
  });
  const email = parseUserEmail(args, "email", {
    optional: false,
    nullable: false,
  });
  const password = parseUserPassword(args, "password", {
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
