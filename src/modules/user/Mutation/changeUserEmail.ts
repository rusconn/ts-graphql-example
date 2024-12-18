import { sql } from "kysely";

import type { MutationChangeUserEmailArgs, MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { numChars, parseErr } from "../../common/parsers.ts";
import { forbiddenErr } from "../../common/resolvers.ts";
import { EMAIL_MAX } from "./signup.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    changeUserEmail(
      """
      ${EMAIL_MAX}文字まで、既に存在する場合はエラー
      """
      email: EmailAddress!
    ): ChangeUserEmailResult
  }

  union ChangeUserEmailResult =
      ChangeUserEmailSuccess
    | InvalidInputError
    | UserEmailAlreadyTakenError

  type ChangeUserEmailSuccess {
    user: User!
  }
`;

export const resolver: MutationResolvers["changeUserEmail"] = async (_parent, args, context) => {
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
      .where("email", "=", parsed.email)
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
        email: parsed.email,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return { type: "ok", changed } as const;
  });

  switch (result.type) {
    case "alreadyTaken":
      return {
        __typename: "UserEmailAlreadyTakenError",
        message: "email already taken",
      };
    case "ok":
      return {
        __typename: "ChangeUserEmailSuccess",
        user: result.changed,
      };
    default:
      throw new Error(result satisfies never);
  }
};

const parseArgs = (args: MutationChangeUserEmailArgs) => {
  const { email } = args;

  if (numChars(email) > EMAIL_MAX) {
    return parseErr(`"email" must be up to ${EMAIL_MAX} characters`);
  }

  return { email };
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const validEmail = "test@example.com";

    const valids = [
      { email: validEmail },
      { email: "a".repeat(EMAIL_MAX - validEmail.length) + validEmail },
    ] as MutationChangeUserEmailArgs[];

    const invalids = [
      { email: "a".repeat(EMAIL_MAX - validEmail.length + 1) + validEmail },
    ] as MutationChangeUserEmailArgs[];

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
