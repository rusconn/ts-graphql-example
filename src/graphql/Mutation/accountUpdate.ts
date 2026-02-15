import { Result } from "neverthrow";

import * as Dto from "../../application/queries/dto.ts";
import { User } from "../../domain/entities.ts";
import type { ContextForAuthed } from "../../server/context.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/global/forbidden.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { invalidInputErrors } from "../_errors/user/invalid-input.ts";
import { parseUserName } from "../_parsers/user/name.ts";
import type { MutationAccountUpdateArgs, MutationResolvers } from "../_schema.ts";

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
  if (parsed.isErr()) {
    return invalidInputErrors(parsed.error);
  }

  return await logic(ctx, parsed.value);
};

const parseArgs = (args: MutationAccountUpdateArgs) => {
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
};

const logic = async (
  ctx: ContextForAuthed,
  input: Parameters<typeof User.updateAccount>[1],
): Promise<ReturnType<MutationResolvers["accountUpdate"]>> => {
  const user = await ctx.repos.user.find(ctx.user.id);
  if (!user) {
    throw internalServerError();
  }

  const updatedUser = User.updateAccount(user, input);
  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.user.update(updatedUser);
    });
  } catch (e) {
    throw internalServerError(e);
  }

  return {
    __typename: "AccountUpdateSuccess",
    user: Dto.User.fromDomain(updatedUser),
  };
};

if (import.meta.vitest) {
  describe("parsing", () => {
    const valids: MutationAccountUpdateArgs[] = [
      {},
      { name: "a".repeat(User.Name.MIN) },
      { name: "a".repeat(User.Name.MAX) },
    ];

    const invalids: [MutationAccountUpdateArgs, (keyof MutationAccountUpdateArgs)[]][] = [
      [{ name: null }, ["name"]],
      [{ name: "a".repeat(User.Name.MIN - 1) }, ["name"]],
      [{ name: "a".repeat(User.Name.MAX + 1) }, ["name"]],
    ];

    it.each(valids)("succeeds when args is valid: %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed.isOk()).toBe(true);
    });

    it.each(invalids)("failes when args is invalid: %#", (args, fields) => {
      const parsed = parseArgs(args);
      expect(parsed.isErr()).toBe(true);
      expect(parsed._unsafeUnwrapErr().map((e) => e.field)).toStrictEqual(fields);
    });
  });
}
