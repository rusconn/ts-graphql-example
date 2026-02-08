import { Credential, RefreshToken, User } from "../../domain.ts";
import type { MutationResolvers, MutationSignupArgs } from "../../schema.ts";
import { signedJwt } from "../../util/accessToken.ts";
import { setRefreshTokenCookie } from "../../util/refreshToken.ts";
import { authGuest } from "../_authorizers/guest.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { invalidInputErrors, ParseErr } from "../_parsers/util.ts";

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
      ${Credential.Password.MIN}文字以上、${Credential.Password.MAX}文字まで
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

  const user = User.create(parsed.user);
  const credential = await Credential.create(user.id, parsed.credential);
  const { rawRefreshToken, refreshToken } = await RefreshToken.create(user.id);

  {
    const trx = await ctx.db.startTransaction().execute();

    const result1 = await ctx.repos.user.add(user, trx);
    switch (result1) {
      case "Ok":
        break;
      case "EmailAlreadyExists":
        await trx.rollback().execute();
        return {
          __typename: "EmailAlreadyTakenError",
          message: "The email already taken.",
        };
      case "Failed":
        await trx.rollback().execute();
        throw internalServerError();
      default:
        throw new Error(result1 satisfies never);
    }

    const result2 = await ctx.repos.credential.add(credential, trx);
    switch (result2) {
      case "Ok":
        break;
      case "Failed":
        await trx.rollback().execute();
        throw internalServerError();
      default:
        throw new Error(result2 satisfies never);
    }

    const result3 = await ctx.repos.refreshToken.add(refreshToken, trx);
    switch (result3) {
      case "Ok":
        break;
      case "Failed":
        await trx.rollback().execute();
        throw internalServerError();
      default:
        throw new Error(result3 satisfies never);
    }

    await trx.commit().execute();
  }

  await setRefreshTokenCookie(ctx.request, rawRefreshToken);

  return {
    __typename: "SignupSuccess",
    token: await signedJwt(user),
  };
};

const parseArgs = (args: MutationSignupArgs) => {
  const user = User.parse(args);
  const credential = Credential.parse(args);

  if (
    Array.isArray(user) || //
    Array.isArray(credential)
  ) {
    const errors: ParseErr[] = [];

    if (Array.isArray(user)) {
      errors.push(...fromParseErrors(user));
    }
    if (Array.isArray(credential)) {
      errors.push(...fromParseErrors(credential));
    }

    return errors;
  } else {
    return { user, credential };
  }
};

const fromParseErrors = (es: (User.ParseError | Credential.ParseError)[]) => {
  return es.map((e) => new ParseErr(e.prop, e.type));
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const validArgs: MutationSignupArgs = {
      name: "name",
      email: "email@email.com",
      password: "password",
    };

    const invalidArgs: MutationSignupArgs = {
      name: "A".repeat(User.Name.MAX + 1),
      email: `${"A".repeat(User.Email.MAX - 10 + 1)}@email.com`,
      password: "A".repeat(Credential.Password.MIN - 1),
    };

    const valids: MutationSignupArgs[] = [
      { ...validArgs },
      { ...validArgs, name: "A".repeat(User.Name.MAX) },
      { ...validArgs, email: `${"A".repeat(User.Email.MAX - 10)}@email.com` },
      { ...validArgs, password: "A".repeat(Credential.Password.MIN) },
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
