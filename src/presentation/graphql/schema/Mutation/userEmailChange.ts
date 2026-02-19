import { changeUserEmail } from "../../../../application/usecases/change-user-email.ts";
import { User } from "../../../../domain/entities.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenError } from "../_errors/global/forbidden.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { invalidInputErrors } from "../_errors/user/invalid-input.ts";
import { parseUserEmail } from "../_parsers/user/email.ts";
import type { MutationResolvers, MutationUserEmailChangeArgs } from "../_types.ts";

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
    throw forbiddenError(ctx);
  }

  const email = parseArgs(args);
  if (email.isErr()) {
    return invalidInputErrors([email.error]);
  }

  const result = await changeUserEmail(ctx, email.value);
  switch (result.type) {
    case "UserEntityNotFound":
      throw internalServerError();
    case "EmailAlreadyTaken":
      return {
        __typename: "EmailAlreadyTakenError",
        message: "The email already taken.",
      };
    case "TransactionFailed":
      throw internalServerError(result.cause);
    case "Success":
      return {
        __typename: "UserEmailChangeSuccess",
        user: result.changed,
      };
    default:
      throw new Error(result satisfies never);
  }
};

const parseArgs = (args: MutationUserEmailChangeArgs) => {
  return parseUserEmail(args, "email", {
    optional: false,
    nullable: false,
  });
};

if (import.meta.vitest) {
  describe("parsing", () => {
    const valids: MutationUserEmailChangeArgs[] = [
      { email: "email@example.com" },
      { email: `${"a".repeat(User.Email.MAX - 12)}@example.com` },
    ];

    const invalids: [MutationUserEmailChangeArgs, (keyof MutationUserEmailChangeArgs)[]][] = [
      [{ email: `${"a".repeat(User.Email.MAX - 12 + 1)}@example.com` }, ["email"]],
      [{ email: "emailexample.com" }, ["email"]],
    ];

    it.each(valids)("succeeds when args is valid: %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed.isOk()).toBe(true);
    });

    it.each(invalids)("failes when args is invalid: %#", (args, fields) => {
      const parsed = parseArgs(args);
      expect(parsed.isErr()).toBe(true);
      expect([parsed._unsafeUnwrapErr().field]).toStrictEqual(fields);
    });
  });
}
