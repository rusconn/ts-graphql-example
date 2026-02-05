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

  const updatedUser: typeof user = {
    ...user,
    ...parsed,
    updatedAt: new Date(),
  };

  const result = await ctx.repos.user.save(updatedUser);
  switch (result.type) {
    case "Ok":
      break;
    case "Forbidden":
    case "NotFound":
    case "EmailAlreadyExists":
    case "Unknown":
      throw internalServerError(result.e);
    default:
      throw new Error(result satisfies never);
  }

  const updated = await ctx.queries.user.findById(user.id);
  if (!updated) {
    throw internalServerError();
  }

  return {
    __typename: "AccountUpdateSuccess",
    user: updated,
  };
};

const parseArgs = (args: MutationAccountUpdateArgs) => {
  const name = parseUserName(args, "name", {
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
      ...(name != null && {
        name,
      }),
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
