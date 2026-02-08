import { User } from "../../domain.ts";
import type { MutationResolvers, MutationUserEmailChangeArgs } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { invalidInputErrors, ParseErr } from "../_parsers/util.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    userEmailChange(
      """
      ${User.Email.MAX}文字まで、既に存在する場合はエラー
      """
      email: String!
    ): UserEmailChangeResult @semanticNonNull @complexity(value: 5)
  }

  union UserEmailChangeResult = UserEmailChangeSuccess | InvalidInputErrors | EmailAlreadyTakenError

  type UserEmailChangeSuccess {
    user: User!
  }
`;

export const resolver: MutationResolvers["userEmailChange"] = async (_parent, args, context) => {
  const ctx = authAuthenticated(context);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  const parsed = parseArgs(args);
  if (Array.isArray(parsed)) {
    return invalidInputErrors(parsed);
  }

  const user = await ctx.repos.user.findByDbId(ctx.user.id);
  if (!user) {
    throw internalServerError();
  }

  const changedUser = User.changeEmail(user, parsed);
  const result = await ctx.repos.user.update(changedUser);
  switch (result) {
    case "Ok":
      break;
    case "EmailAlreadyExists":
      return {
        __typename: "EmailAlreadyTakenError",
        message: "The email already taken.",
      };
    case "NotFound":
      throw internalServerError();
    default:
      throw new Error(result satisfies never);
  }

  const changed = await ctx.queries.user.findById(user.id);
  if (!changed) {
    throw internalServerError();
  }

  return {
    __typename: "UserEmailChangeSuccess",
    user: changed,
  };
};

const parseArgs = (args: MutationUserEmailChangeArgs) => {
  const email = parseEmail(args);

  if (
    Array.isArray(email) //
  ) {
    const errors: ParseErr[] = [];

    if (Array.isArray(email)) {
      errors.push(...email);
    }

    return errors;
  } else {
    return { email };
  }
};

const parseEmail = (args: MutationUserEmailChangeArgs) => {
  const email = User.Email.parse(args.email);

  return Array.isArray(email)
    ? email.map((e) => new ParseErr("email", e)) //
    : email;
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids: MutationUserEmailChangeArgs[] = [
      { email: "email@email.com" },
      { email: `${"A".repeat(User.Email.MAX - 10)}@email.com` },
    ];

    const invalids: [MutationUserEmailChangeArgs, (keyof MutationUserEmailChangeArgs)[]][] = [
      [{ email: `${"A".repeat(User.Email.MAX - 10 + 1)}@email.com` }, ["email"]],
      [{ email: "emailemail.com" }, ["email"]],
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
