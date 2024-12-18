import { sql } from "kysely";

import type { MutationChangeUserNameArgs, MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { numChars, parseErr } from "../../common/parsers.ts";
import { forbiddenErr } from "../../common/resolvers.ts";
import { isName } from "../common/parser.ts";
import { NAME_MAX, NAME_MIN } from "./signup.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    changeUserName(
      """
      ${NAME_MAX}文字まで、既に存在する場合はエラー
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

    const exists = await trx
      .selectFrom("User")
      .where("name", "=", parsed.name)
      .select("id")
      .executeTakeFirst();

    if (exists) {
      return { type: "alreadyTaken" } as const;
    }

    const changed = await trx
      .updateTable("User")
      .where("id", "=", authed.id)
      .set({
        updatedAt: new Date(),
        name: parsed.name,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

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
  const { name } = args;

  if (numChars(name) < NAME_MIN) {
    return parseErr(`"name" must be at least ${NAME_MIN} characters`);
  }
  if (numChars(name) > NAME_MAX) {
    return parseErr(`"name" must be up to ${NAME_MAX} characters`);
  }
  if (!isName(name)) {
    return parseErr(`invalid "name"`);
  }

  return { name };
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids = [
      { name: "foobar" },
      { name: "A".repeat(NAME_MIN) },
      { name: "A".repeat(NAME_MAX) },
    ] as MutationChangeUserNameArgs[];

    const invalids = [
      { name: "A".repeat(NAME_MIN - 1) },
      { name: "A".repeat(NAME_MAX + 1) },
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
