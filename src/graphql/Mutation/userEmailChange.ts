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
    ): UserEmailChangeResult
  }

  union UserEmailChangeResult =
      UserEmailChangeSuccess
    | InvalidInputErrors
    | UserEmailAlreadyTakenError

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
        __typename: "UserEmailAlreadyTakenError",
        message: "email already taken",
      };
    case "NameAlreadyExists":
      throw new Error("unreachable");
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
    const validEmail = "test@example.com";

    const valids: MutationUserEmailChangeArgs[] = [
      { email: validEmail },
      { email: "a".repeat(USER_EMAIL_MAX - validEmail.length) + validEmail },
    ];

    const invalids: [MutationUserEmailChangeArgs, (keyof MutationUserEmailChangeArgs)[]][] = [
      [{ email: "a".repeat(USER_EMAIL_MAX - validEmail.length + 1) + validEmail }, ["email"]],
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
