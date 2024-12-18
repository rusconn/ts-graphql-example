import bcrypt from "bcrypt";

import { passHashExp } from "../../../config.ts";
import type { MutationChangeLoginPasswordArgs, MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers/authenticated.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { internalServerError } from "../../common/errors/internalServerError.ts";
import { userId } from "../adapters/id.ts";
import { USER_PASSWORD_MAX, USER_PASSWORD_MIN, parseUserPassword } from "../parsers/password.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    changeLoginPassword(
      """
      ${USER_PASSWORD_MIN}文字以上、${USER_PASSWORD_MAX}文字まで
      """
      password: NonEmptyString!
    ): ChangeLoginPasswordResult
  }

  union ChangeLoginPasswordResult = ChangeLoginPasswordSuccess | InvalidInputError

  type ChangeLoginPasswordSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["changeLoginPassword"] = async (
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
    __typename: "ChangeLoginPasswordSuccess",
    id: userId(changed.id),
  };
};

const parseArgs = (args: MutationChangeLoginPasswordArgs) => {
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
    ] as MutationChangeLoginPasswordArgs[];

    const invalids = [
      { password: "A".repeat(USER_PASSWORD_MIN - 1) },
      { password: "A".repeat(USER_PASSWORD_MAX + 1) },
    ] as MutationChangeLoginPasswordArgs[];

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
