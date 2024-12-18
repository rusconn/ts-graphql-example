import bcrypt from "bcrypt";

import { passHashExp } from "../../../config.ts";
import type { MutationChangeLoginPasswordArgs, MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { numChars, parseErr } from "../../common/parsers.ts";
import { forbiddenErr } from "../../common/resolvers.ts";
import { userNodeId } from "../common/adapter.ts";
import { PASS_MAX, PASS_MIN } from "./signup.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    changeLoginPassword(
      """
      ${PASS_MIN}文字以上、${PASS_MAX}文字まで
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

  const changed = await context.db
    .updateTable("User")
    .where("id", "=", authed.id)
    .set({
      updatedAt: new Date(),
      password: hashed,
    })
    .returning("id")
    .executeTakeFirstOrThrow();

  return {
    __typename: "ChangeLoginPasswordSuccess",
    id: userNodeId(changed.id),
  };
};

const parseArgs = (args: MutationChangeLoginPasswordArgs) => {
  const { password } = args;

  if (numChars(password) < PASS_MIN) {
    return parseErr(`"password" must be at least ${PASS_MIN} characters`);
  }
  if (numChars(password) > PASS_MAX) {
    return parseErr(`"password" must be up to ${PASS_MAX} characters`);
  }

  return { password };
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids = [
      { password: "passwordpassword" },
      { password: "A".repeat(PASS_MIN) },
      { password: "A".repeat(PASS_MAX) },
    ] as MutationChangeLoginPasswordArgs[];

    const invalids = [
      { password: "A".repeat(PASS_MIN - 1) },
      { password: "A".repeat(PASS_MAX + 1) },
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
