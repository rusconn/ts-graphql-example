import { Result } from "neverthrow";

import { updateAccount } from "../../../../application/usecases/update-account.ts";
import { User } from "../../../../domain/entities.ts";
import { assertAuthenticated } from "../_authorizers/authenticated.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { invalidInputErrors } from "../_errors/user/invalid-input.ts";
import { parseUserName } from "../_parsers/user/name.ts";
import type { MutationAccountUpdateArgs, MutationResolvers } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    """
    ログイン済のみ
    """
    accountUpdate(
      """
      ${User.Name.MIN}文字以上、${User.Name.MAX}文字まで、null は入力エラー
      """
      name: String
    ): AccountUpdateResult @semanticNonNull @complexity(value: 50)
  }

  union AccountUpdateResult = AccountUpdateSuccess | InvalidInputErrors

  type AccountUpdateSuccess {
    user: User!
  }
`;

export const resolver: MutationResolvers["accountUpdate"] = async (_parent, args, ctx) => {
  assertAuthenticated(ctx);

  const parsed = parseArgs(args);
  if (parsed.isErr()) {
    return invalidInputErrors(parsed.error);
  }

  const result = await updateAccount(ctx, parsed.value);
  switch (result.type) {
    case "UserEntityNotFound":
      throw internalServerError();
    case "TransactionFailed":
      throw internalServerError(result.cause);
    case "Success":
      return {
        __typename: "AccountUpdateSuccess",
        user: result.updated,
      };
    default:
      throw new Error(result satisfies never);
  }
};

function parseArgs(args: MutationAccountUpdateArgs) {
  return Result.combineWithAllErrors([
    parseUserName(args, "name", {
      optional: true,
      nullable: false,
    }),
  ]).map(([name]) => ({
    ...(name != null && {
      name,
    }),
  }));
}

if (import.meta.vitest) {
  const { testParseArgs } = await import("../_test/helpers.ts");

  testParseArgs(parseArgs, {
    valids: [
      {}, //
      { name: "a".repeat(User.Name.MIN) },
      { name: "a".repeat(User.Name.MAX) },
    ],
    invalids: [
      [{ name: null }, ["name"]],
      [{ name: "a".repeat(User.Name.MIN - 1) }, ["name"]],
      [{ name: "a".repeat(User.Name.MAX + 1) }, ["name"]],
    ],
  });
}
