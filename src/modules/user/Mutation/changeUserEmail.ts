import { sql } from "kysely";

import type { MutationChangeUserEmailArgs, MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers/authenticated.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { internalServerError } from "../../common/errors/internalServerError.ts";
import { USER_EMAIL_MAX, parseUserEmail } from "../parsers/email.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    changeUserEmail(
      """
      ${USER_EMAIL_MAX}文字まで、既に存在する場合はエラー
      """
      email: NonEmptyString!
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

    const exists = await context.api.user.getByEmail(parsed.email, trx);

    if (exists) {
      return { type: "alreadyTaken" } as const;
    }

    const changed = await context.api.user.updateById(
      authed.id,
      {
        email: parsed.email,
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
  const email = parseUserEmail(args, {
    optional: false,
    nullable: false,
  });

  if (email instanceof Error) {
    return email;
  }

  return { email };
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const validEmail = "test@example.com";

    const valids = [
      { email: validEmail },
      { email: "a".repeat(USER_EMAIL_MAX - validEmail.length) + validEmail },
    ] as MutationChangeUserEmailArgs[];

    const invalids = [
      { email: "a".repeat(USER_EMAIL_MAX - validEmail.length + 1) + validEmail },
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
