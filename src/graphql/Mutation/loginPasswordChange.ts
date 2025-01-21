import type { MutationLoginPasswordChangeArgs, MutationResolvers } from "../../schema.ts";
import { userId } from "../_adapters/user/id.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import {
  USER_PASSWORD_MAX,
  USER_PASSWORD_MIN,
  parseUserPassword,
} from "../_parsers/user/password.ts";
import { ParseErr, invalidInputErrors } from "../_parsers/util.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    loginPasswordChange(
      """
      ${USER_PASSWORD_MIN}文字以上、${USER_PASSWORD_MAX}文字まで
      """
      password: String!
    ): LoginPasswordChangeResult
  }

  union LoginPasswordChangeResult = LoginPasswordChangeSuccess | InvalidInputErrors

  type LoginPasswordChangeSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["loginPasswordChange"] = async (
  _parent,
  args,
  context,
) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseArgs(args);

  if (Array.isArray(parsed)) {
    return invalidInputErrors(parsed);
  }

  const id = await context.api.user.updatePasswordById(authed.id, parsed.password);

  if (!id) {
    throw internalServerError();
  }

  return {
    __typename: "LoginPasswordChangeSuccess",
    id: userId(id),
  };
};

const parseArgs = (args: MutationLoginPasswordChangeArgs) => {
  const password = parseUserPassword(args.password, "password", {
    optional: false,
    nullable: false,
  });

  if (
    password instanceof ParseErr //
  ) {
    const errors = [];

    if (password instanceof ParseErr) {
      errors.push(password);
    }

    return errors;
  } else {
    return { password };
  }
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids: MutationLoginPasswordChangeArgs[] = [
      { password: "passwordpassword" },
      { password: "A".repeat(USER_PASSWORD_MIN) },
      { password: "A".repeat(USER_PASSWORD_MAX) },
    ];

    const invalids: [MutationLoginPasswordChangeArgs, (keyof MutationLoginPasswordChangeArgs)[]][] =
      [
        [{ password: "A".repeat(USER_PASSWORD_MIN - 1) }, ["password"]],
        [{ password: "A".repeat(USER_PASSWORD_MAX + 1) }, ["password"]],
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
