import { Result } from "neverthrow";

import { RefreshToken, User } from "../../domain/entities.ts";
import { EmailAlreadyExistsError } from "../../domain/unit-of-works/_errors/email-already-exists.ts";
import { signedJwt } from "../../util/access-token.ts";
import { setRefreshTokenCookie } from "../../util/refresh-token.ts";
import { authGuest } from "../_authorizers/guest.ts";
import { forbiddenErr } from "../_errors/global/forbidden.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { invalidInputErrors } from "../_errors/user/invalid-input.ts";
import { parseUserEmail } from "../_parsers/user/email.ts";
import { parseUserName } from "../_parsers/user/name.ts";
import { parseUserPassword } from "../_parsers/user/password.ts";
import type { MutationResolvers, MutationSignupArgs } from "../_schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    signup(
      """
      ${User.Name.MIN}文字以上、${User.Name.MAX}文字まで
      """
      name: String!

      """
      ${User.Email.MAX}文字まで、既に存在する場合はエラー
      """
      email: String!

      """
      ${User.Password.MIN}文字以上、${User.Password.MAX}文字まで
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
  if (parsed.isErr()) {
    return invalidInputErrors(parsed.error);
  }

  const user = await User.create(parsed.value);
  const { rawRefreshToken, refreshToken } = await RefreshToken.create(user.id);
  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.user.add(user);
      await repos.refreshToken.add(refreshToken);
    });
  } catch (e) {
    if (e instanceof EmailAlreadyExistsError) {
      return {
        __typename: "EmailAlreadyTakenError",
        message: "The email already taken.",
      };
    }
    throw internalServerError(e);
  }

  await setRefreshTokenCookie(ctx, rawRefreshToken);

  return {
    __typename: "SignupSuccess",
    token: await signedJwt(user),
  };
};

const parseArgs = (args: MutationSignupArgs) => {
  return Result.combineWithAllErrors([
    parseUserName(args, "name", {
      optional: false,
      nullable: false,
    }),
    parseUserEmail(args, "email", {
      optional: false,
      nullable: false,
    }),
    parseUserPassword(args, "password", {
      optional: false,
      nullable: false,
    }),
  ]).map(([name, email, password]) => ({
    name,
    email,
    password,
  }));
};

if (import.meta.vitest) {
  describe("parsing", () => {
    const validArgs: MutationSignupArgs = {
      name: "name",
      email: "email@example.com",
      password: "password",
    };

    const invalidArgs: MutationSignupArgs = {
      name: "A".repeat(User.Name.MAX + 1),
      email: `${"A".repeat(User.Email.MAX - 12 + 1)}@example.com`,
      password: "A".repeat(User.Password.MIN - 1),
    };

    const valids: MutationSignupArgs[] = [
      { ...validArgs },
      { ...validArgs, name: "A".repeat(User.Name.MAX) },
      { ...validArgs, email: `${"A".repeat(User.Email.MAX - 12)}@example.com` },
      { ...validArgs, password: "A".repeat(User.Password.MIN) },
    ];

    const invalids: [MutationSignupArgs, (keyof MutationSignupArgs)[]][] = [
      [{ ...validArgs, name: invalidArgs.name }, ["name"]],
      [{ ...validArgs, email: invalidArgs.email }, ["email"]],
      [{ ...validArgs, password: invalidArgs.password }, ["password"]],
      [{ ...validArgs, ...invalidArgs }, ["name", "email", "password"]],
    ];

    test.each(valids)("valids %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed.isOk()).toBe(true);
    });

    test.each(invalids)("invalids %#", (args, fields) => {
      const parsed = parseArgs(args);
      expect(parsed.isErr()).toBe(true);
      expect(parsed._unsafeUnwrapErr().map((e) => e.field)).toStrictEqual(fields);
    });
  });
}
