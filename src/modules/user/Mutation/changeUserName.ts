import { sql } from "kysely";
import type { MutationChangeUserNameArgs, MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers/authenticated.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { internalServerError } from "../../common/errors/internalServerError.ts";
import { USER_NAME_MAX, USER_NAME_MIN, parseUserName } from "../parsers/name.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    changeUserName(
      """
      ${USER_NAME_MIN}文字以上、${USER_NAME_MAX}文字まで、既に存在する場合はエラー
      """
      name: NonEmptyString!
    ): ChangeUserNameResult
  }

  union ChangeUserNameResult =
      ChangeUserNameSuccess
    | InvalidInputError
    | UserNameAlreadyTakenError

  type ChangeUserNameSuccess {
    user: User!
  }
`;

export const resolver: MutationResolvers["changeUserName"] = async (_parent, args, context) => {
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

    const changed = await context.api.user.updateById(
      authed.id,
      {
        name: parsed.name,
      },
      trx,
    );

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
        __typename: "ChangeUserNameSuccess",
        user: result.changed,
      };
    default:
      throw new Error(result satisfies never);
  }
};

const parseArgs = (args: MutationChangeUserNameArgs) => {
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
    ] as MutationChangeUserNameArgs[];

    const invalids = [
      { name: "A".repeat(USER_NAME_MIN - 1) },
      { name: "A".repeat(USER_NAME_MAX + 1) },
    ] as MutationChangeUserNameArgs[];

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
