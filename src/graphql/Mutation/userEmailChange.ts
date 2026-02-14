import { Result } from "neverthrow";

import { User } from "../../domain/models.ts";
import { EmailAlreadyExistsError } from "../../domain/unit-of-works/_shared/errors.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { parseUserEmail } from "../_parsers/user/email.ts";
import type { MutationResolvers, MutationUserEmailChangeArgs } from "../_schema.ts";
import { invalidInputErrors } from "../_shared/errors.ts";

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

  const user = await ctx.repos.user.find(ctx.user.id);
  if (!user) {
    throw internalServerError();
  }

  const changedUser = User.changeEmail(user, parsed.value.email);
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
    user: changedUser,
  };
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

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids: MutationUserEmailChangeArgs[] = [
      { email: "email@example.com" },
      { email: `${"A".repeat(User.Email.MAX - 12)}@example.com` },
    ];

    const invalids: [MutationUserEmailChangeArgs, (keyof MutationUserEmailChangeArgs)[]][] = [
      [{ email: `${"A".repeat(User.Email.MAX - 12 + 1)}@example.com` }, ["email"]],
      [{ email: "emailexample.com" }, ["email"]],
    ];

    test.each(valids)("valids %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed.isOk()).toBe(true);
    });

    test.each(invalids)("invalids %#", (args, fields) => {
      const parsed = parseArgs(args);
      expect(parsed.isErr()).toBe(true);
      expect(parsed._unsafeUnwrapErr().map((e) => e.field)).toStrictEqual(fields);
    });
  });
}
