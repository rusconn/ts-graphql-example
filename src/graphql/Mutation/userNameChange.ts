import { sql } from "kysely";
import type { MutationResolvers, MutationUserNameChangeArgs } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { USER_NAME_MAX, USER_NAME_MIN, parseUserName } from "../_parsers/user/name.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    userNameChange(
      """
      ${USER_NAME_MIN}文字以上、${USER_NAME_MAX}文字まで、既に存在する場合はエラー
      """
      name: NonEmptyString!
    ): UserNameChangeResult
  }

  union UserNameChangeResult =
      UserNameChangeSuccess
    | InvalidInputError
    | UserNameAlreadyTakenError

  type UserNameChangeSuccess {
    user: User!
  }
`;

export const resolver: MutationResolvers["userNameChange"] = async (_parent, args, context) => {
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

  const result = await context.db.transaction().execute(async (trx) => {
    await sql`LOCK TABLE "User" IN SHARE ROW EXCLUSIVE MODE;`.execute(trx);

    const exists = await context.api.user.getByName(parsed.name, trx);

    if (exists) {
      return { type: "alreadyTaken" } as const;
    }

    const changed = await context.api.user.updateById(authed.id, parsed, trx);

    if (!changed) {
      throw internalServerError();
    }

    return { type: "ok", changed } as const;
  });

  switch (result.type) {
    case "alreadyTaken":
      return {
        __typename: "UserNameAlreadyTakenError",
        message: "name already taken",
      };
    case "ok":
      return {
        __typename: "UserNameChangeSuccess",
        user: result.changed,
      };
    default:
      throw new Error(result satisfies never);
  }
};

const parseArgs = (args: MutationUserNameChangeArgs) => {
  const name = parseUserName(args, {
    optional: false,
    nullable: false,
  });

  if (name instanceof Error) {
    return name;
  }

  return { name };
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids = [
      { name: "foobar" },
      { name: "A".repeat(USER_NAME_MIN) },
      { name: "A".repeat(USER_NAME_MAX) },
    ] as MutationUserNameChangeArgs[];

    const invalids = [
      { name: "A".repeat(USER_NAME_MIN - 1) },
      { name: "A".repeat(USER_NAME_MAX + 1) },
    ] as MutationUserNameChangeArgs[];

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
