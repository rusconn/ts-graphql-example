import bcrypt from "bcrypt";

import { passHashExp } from "../../config.ts";
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

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    loginPasswordChange(
      """
      ${USER_PASSWORD_MIN}文字以上、${USER_PASSWORD_MAX}文字まで
      """
      password: NonEmptyString!
    ): LoginPasswordChangeResult
  }

  union LoginPasswordChangeResult = LoginPasswordChangeSuccess | InvalidInputError

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

  if (parsed instanceof Error) {
    return {
      __typename: "InvalidInputError",
      message: parsed.message,
    };
  }

  const hashed = await bcrypt.hash(parsed.password, passHashExp);

  const changed = await context.api.user.updateById(authed.id, {
    password: hashed,
  });

  if (!changed) {
    throw internalServerError();
  }

  return {
    __typename: "LoginPasswordChangeSuccess",
    id: userId(changed.id),
  };
};

const parseArgs = (args: MutationLoginPasswordChangeArgs) => {
  const password = parseUserPassword(args, {
    optional: false,
    nullable: false,
  });

  if (password instanceof Error) {
    return password;
  }

  return { password };
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids = [
      { password: "passwordpassword" },
      { password: "A".repeat(USER_PASSWORD_MIN) },
      { password: "A".repeat(USER_PASSWORD_MAX) },
    ] as MutationLoginPasswordChangeArgs[];

    const invalids = [
      { password: "A".repeat(USER_PASSWORD_MIN - 1) },
      { password: "A".repeat(USER_PASSWORD_MAX + 1) },
    ] as MutationLoginPasswordChangeArgs[];

    test.each(valids)("valids %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed instanceof Error).toBe(false);
    });

    test.each(invalids)("invalids %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed instanceof Error).toBe(true);
    });
  });
}
