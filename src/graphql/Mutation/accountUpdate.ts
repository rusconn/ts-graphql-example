import { User } from "../../domain.ts";
import type { MutationAccountUpdateArgs, MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { invalidInputErrors, parseArgNullability, ParseErr } from "../_parsers/util.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    accountUpdate(
      """
      ${User.Name.MIN}文字以上、${User.Name.MAX}文字まで、null は入力エラー
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

  const updatedUser = User.update(user, parsed);
  const result = await ctx.repos.user.update(updatedUser);
  switch (result) {
    case "Ok":
      break;
    case "NotFound":
    case "EmailAlreadyExists":
      throw internalServerError();
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
  const name = parseName(args);

  if (
    Array.isArray(name) //
  ) {
    const errors: ParseErr[] = [];

    if (Array.isArray(name)) {
      errors.push(...name);
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

const parseName = (args: MutationAccountUpdateArgs) => {
  const result1 = parseArgNullability(args, "name", {
    optional: true,
    nullable: false,
  });
  if (result1 instanceof ParseErr) {
    return [result1];
  }
  if (result1 == null) {
    return;
  }

  const result2 = User.Name.parse(result1);

  return Array.isArray(result2)
    ? result2.map((e) => new ParseErr("name", e)) //
    : result2;
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids: MutationAccountUpdateArgs[] = [
      {},
      { name: "name" },
      { name: "A".repeat(User.Name.MAX) },
    ];

    const invalids: [MutationAccountUpdateArgs, (keyof MutationAccountUpdateArgs)[]][] = [
      [{ name: null }, ["name"]],
      [{ name: "A".repeat(User.Name.MAX + 1) }, ["name"]],
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
