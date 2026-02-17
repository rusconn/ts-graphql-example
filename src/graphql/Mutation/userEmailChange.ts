import { Result } from "neverthrow";

import * as Dto from "../../application/queries/dto.ts";
import { User } from "../../domain/entities.ts";
import { EmailAlreadyExistsError } from "../../domain/unit-of-works/_errors/email-already-exists.ts";
import type { ContextForAuthed } from "../../server/context.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/global/forbidden.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { invalidInputErrors } from "../_errors/user/invalid-input.ts";
import { parseUserEmail } from "../_parsers/user/email.ts";
import type { MutationResolvers, MutationUserEmailChangeArgs } from "../_schema.ts";

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
  if (parsed.isErr()) {
    return invalidInputErrors(parsed.error);
  }

  return await logic(ctx, parsed.value);
};

const parseArgs = (args: MutationUserEmailChangeArgs) => {
  return Result.combineWithAllErrors([
    parseUserEmail(args, "email", {
      optional: false,
      nullable: false,
    }),
  ]).map(([email]) => ({
    email,
  }));
};

const logic = async (
  ctx: ContextForAuthed,
  input: Parameters<typeof User.changeEmail>[1],
): Promise<ReturnType<MutationResolvers["userEmailChange"]>> => {
  const user = await ctx.repos.user.find(ctx.user.id);
  if (!user) {
    throw internalServerError();
  }

  const changedUser = User.changeEmail(user, input);
  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.user.update(changedUser);
    });
  } catch (e) {
    if (e instanceof EmailAlreadyExistsError) {
      return {
        __typename: "EmailAlreadyTakenError",
        message: "The email already taken.",
      };
    }
    throw internalServerError(e);
  }

  return {
    __typename: "UserEmailChangeSuccess",
    user: Dto.User.fromDomain(changedUser),
  };
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
      expect(parsed._unsafeUnwrapErr().map((e) => e.field)).toStrictEqual(fields);
    });
  });
}
