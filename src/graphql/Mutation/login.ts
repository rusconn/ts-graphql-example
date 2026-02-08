import { Credential, RefreshToken, User } from "../../domain.ts";
import type { MutationLoginArgs, MutationResolvers } from "../../schema.ts";
import { signedJwt } from "../../util/accessToken.ts";
import { setRefreshTokenCookie } from "../../util/refreshToken.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { invalidInputErrors, ParseErr } from "../_parsers/util.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    login(
      """
      ${User.Email.MAX}文字まで
      """
      email: String!

      """
      ${Credential.Password.MIN}文字以上、${Credential.Password.MAX}文字まで
      """
      password: String!
    ): LoginResult @semanticNonNull @complexity(value: 100)
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

  const credential = await context.repos.credential.findByDbEmail(email);
  if (!credential) {
    return {
      __typename: "LoginFailedError",
      message: "Incorrect email or password.",
    };
  }

  const match = await Credential.Password.match(password, credential.password);
  if (!match) {
    return {
      __typename: "LoginFailedError",
      message: "Incorrect email or password.",
    };
  }

  const { rawRefreshToken, refreshToken } = await RefreshToken.create(credential.id);

  {
    const trx = await context.db.startTransaction().execute();

    const result = await context.repos.refreshToken.add(refreshToken, trx);
    switch (result) {
      case "Ok":
        break;
      case "Failed":
        await trx.rollback().execute();
        throw internalServerError();
      default:
        throw new Error(result satisfies never);
    }

    await context.repos.refreshToken.retainLatest(credential.id, RefreshToken.MAX_RETENTION, trx);

    await trx.commit().execute();
  }

  const token = await signedJwt(credential);
  await setRefreshTokenCookie(context.request, rawRefreshToken);

  return {
    __typename: "LoginSuccess",
    token,
  };
};

const parseArgs = (args: MutationLoginArgs) => {
  const email = parseEmail(args);
  const password = parsePassword(args);

  if (
    Array.isArray(email) || //
    Array.isArray(password)
  ) {
    const errors: ParseErr[] = [];

    if (Array.isArray(email)) {
      errors.push(...email);
    }
    if (Array.isArray(password)) {
      errors.push(...password);
    }

    return errors;
  } else {
    return { email, password };
  }
};

const parseEmail = (args: MutationLoginArgs) => {
  const result = User.Email.parse(args.email);

  return Array.isArray(result)
    ? result.map((e) => new ParseErr("email", e)) //
    : result;
};

const parsePassword = (args: MutationLoginArgs) => {
  const result = Credential.Password.parse(args.password);

  return Array.isArray(result)
    ? result.map((e) => new ParseErr("password", e)) //
    : result;
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const validArgs: MutationLoginArgs = {
      email: "email@email.com",
      password: "password",
    };

    const invalidArgs: MutationLoginArgs = {
      email: `${"A".repeat(User.Email.MAX - 10 + 1)}@email.com`,
      password: "A".repeat(Credential.Password.MIN - 1),
    };

    const valids: MutationLoginArgs[] = [
      { ...validArgs },
      { ...validArgs, email: `${"A".repeat(User.Email.MAX - 10)}@email.com` },
      { ...validArgs, password: "A".repeat(Credential.Password.MIN) },
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
