import type { MutationAccountUpdateArgs, MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { parseUserName, USER_NAME_MAX, USER_NAME_MIN } from "../_parsers/user/name.ts";
import { invalidInputErrors, ParseErr } from "../_parsers/util.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    accountUpdate(
      """
      ${USER_NAME_MIN}文字以上、${USER_NAME_MAX}文字まで、null は入力エラー
      """
      name: String
    ): AccountUpdateResult @semanticNonNull @complexity(value: 5)
  }

  union AccountUpdateResult = AccountUpdateSuccess | InvalidInputErrors

  type AccountUpdateSuccess {
    user: User!
  }
`;

export const resolver: MutationResolvers["accountUpdate"] = async (_parent, args, context) => {
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
        __typename: "AccountUpdateSuccess",
        user: result,
      };
    case "EmailAlreadyExists":
      throw new Error("unreachable");
    case "Unknown":
      throw internalServerError(result.e);
    default:
      throw new Error(result satisfies never);
  }
};

const parseArgs = (args: MutationAccountUpdateArgs) => {
  const name = parseUserName(args.name, "name", {
    optional: true,
    nullable: false,
  });

  if (
    name instanceof ParseErr //
  ) {
    const errors = [];

    if (name instanceof ParseErr) {
      errors.push(name);
    }

    return errors;
  } else {
    return {
      ...(name != null && { name }),
    };
  }
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids: MutationAccountUpdateArgs[] = [
      {},
      { name: "name" },
      { name: "A".repeat(USER_NAME_MAX) },
    ];

    const invalids: [MutationAccountUpdateArgs, (keyof MutationAccountUpdateArgs)[]][] = [
      [{ name: null }, ["name"]],
      [{ name: "A".repeat(USER_NAME_MAX + 1) }, ["name"]],
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
