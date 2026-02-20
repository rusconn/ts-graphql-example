import { deleteAccount } from "../../../../application/usecases/delete-account.ts";
import { User } from "../../../../domain/entities.ts";
import * as RefreshTokenCookie from "../../../_shared/auth/refresh-token-cookie.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenError } from "../_errors/global/forbidden.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { invalidInputErrors } from "../_errors/user/invalid-input.ts";
import { parseUserPassword } from "../_parsers/user/password.ts";
import type { MutationAccountDeleteArgs, MutationResolvers } from "../_types.ts";
import { userId } from "../User/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    """
    紐づくリソースは全て削除される
    """
    accountDelete(
      """
      ${User.Password.MIN}文字以上、${User.Password.MAX}文字まで
      """
      password: String!
    ): AccountDeleteResult @semanticNonNull @complexity(value: 5)
  }

  union AccountDeleteResult = AccountDeleteSuccess | InvalidInputErrors | IncorrectPasswordError

  type AccountDeleteSuccess {
    id: ID!
  }

  type IncorrectPasswordError implements Error {
    message: String!
  }
`;

export const resolver: MutationResolvers["accountDelete"] = async (_parent, args, context) => {
  const ctx = authAuthenticated(context);
  if (Error.isError(ctx)) {
    throw forbiddenError(ctx);
  }

  const password = parseArgs(args);
  if (password.isErr()) {
    return invalidInputErrors([password.error]);
  }

  const result = await deleteAccount(ctx, password.value);
  switch (result.type) {
    case "UserEntityNotFound":
      throw internalServerError();
    case "IncorrectPassword":
      return {
        __typename: "IncorrectPasswordError",
        message: "The password is incorrect.",
      };
    case "TransactionFailed":
      throw internalServerError(result.cause);
    case "Success":
      await RefreshTokenCookie.clear(ctx);
      return {
        __typename: "AccountDeleteSuccess",
        id: userId(ctx.user.id),
      };
    default:
      throw new Error(result satisfies never);
  }
};

const parseArgs = (args: MutationAccountDeleteArgs) => {
  return parseUserPassword(args, "password", {
    optional: false,
    nullable: false,
  });
};

if (import.meta.vitest) {
  describe("parsing", () => {
    const valids: MutationAccountDeleteArgs[] = [
      { password: "password" },
      { password: "a".repeat(User.Password.MIN) },
    ];

    const invalids: [MutationAccountDeleteArgs, (keyof MutationAccountDeleteArgs)[]][] = [
      [{ password: "a".repeat(User.Password.MIN - 1) }, ["password"]],
      [{ password: "a".repeat(User.Password.MAX + 1) }, ["password"]],
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
