import type { MutationResolvers, MutationUserEmailChangeArgs } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { USER_EMAIL_MAX, parseUserEmail } from "../_parsers/user/email.ts";
import { ParseErr, invalidInputErrors } from "../_parsers/util.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    userEmailChange(
      """
      ${USER_EMAIL_MAX}文字まで、既に存在する場合はエラー
      """
      email: String!
    ): UserEmailChangeResult @semanticNonNull
  }

  union UserEmailChangeResult = UserEmailChangeSuccess | InvalidInputErrors | EmailAlreadyTakenError

  type UserEmailChangeSuccess {
    user: User!
  }
`;

export const resolver: MutationResolvers["userEmailChange"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseArgs(args);

  if (Array.isArray(parsed)) {
    return invalidInputErrors(parsed);
  }

  const result = await context.api.user.updateById(authed.id, parsed);

  switch (result.type) {
    case "Success":
      return {
        __typename: "UserEmailChangeSuccess",
        user: result,
      };
    case "EmailAlreadyExists":
      return {
        __typename: "EmailAlreadyTakenError",
        message: "The email already taken.",
      };
    case "Unknown":
      throw internalServerError(result.e);
    default:
      throw new Error(result satisfies never);
  }
};

const parseArgs = (args: MutationUserEmailChangeArgs) => {
  const email = parseUserEmail(args.email, "email", {
    optional: false,
    nullable: false,
  });

  if (
    email instanceof ParseErr //
  ) {
    const errors = [];

    if (email instanceof ParseErr) {
      errors.push(email);
    }

    return errors;
  } else {
    return { email };
  }
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids: MutationUserEmailChangeArgs[] = [
      { email: "email@email.com" },
      { email: `${"A".repeat(USER_EMAIL_MAX - 10)}@email.com` },
    ];

    const invalids: [MutationUserEmailChangeArgs, (keyof MutationUserEmailChangeArgs)[]][] = [
      [{ email: `${"A".repeat(USER_EMAIL_MAX - 10 + 1)}@email.com` }, ["email"]],
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
