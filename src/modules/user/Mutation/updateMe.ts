import bcrypt from "bcrypt";

import { passHashExp } from "../../../config.ts";
import type { MutationResolvers, MutationUpdateMeArgs } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { parseErr } from "../../common/parsers.ts";

const NAME_MAX = 100;
const EMAIL_MAX = 100;
const PASS_MIN = 8;
const PASS_MAX = 50;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    "指定したフィールドのみ更新する"
    updateMe(input: UpdateMeInput!): UpdateMeResult
  }

  input UpdateMeInput {
    "${NAME_MAX}文字まで、null は入力エラー"
    name: NonEmptyString
    "${EMAIL_MAX}文字まで、既に存在する場合はエラー、null は入力エラー"
    email: EmailAddress
    "${PASS_MIN}文字以上、${PASS_MAX}文字まで、null は入力エラー"
    password: NonEmptyString
  }

  union UpdateMeResult = UpdateMeSuccess | EmailAlreadyTakenError

  type UpdateMeSuccess {
    user: User!
  }
`;

export const resolver: MutationResolvers["updateMe"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  const { name, email, password } = parseArgs(args);

  if (email) {
    const found = await context.db
      .selectFrom("User")
      .where("email", "=", email)
      .select("id")
      .executeTakeFirst();

    if (found) {
      return {
        __typename: "EmailAlreadyTakenError",
        message: "specified email already taken",
      };
    }
  }

  const hashed = password ? await bcrypt.hash(password, passHashExp) : undefined;

  const updated = await context.db
    .updateTable("User")
    .where("id", "=", authed.id)
    .set({ name, email, password: hashed })
    .returningAll()
    .executeTakeFirstOrThrow();

  return {
    __typename: "UpdateMeSuccess",
    user: updated,
  };
};

const parseArgs = (args: MutationUpdateMeArgs) => {
  const { name, email, password } = args.input;

  if (name === null) {
    throw parseErr('"name" must be not null');
  }
  if (name && [...name].length > NAME_MAX) {
    throw parseErr(`"name" must be up to ${NAME_MAX} characteres`);
  }
  if (email === null) {
    throw parseErr('"email" must be not null');
  }
  if (email && [...email].length > EMAIL_MAX) {
    throw parseErr(`"email" must be up to ${EMAIL_MAX} characteres`);
  }
  if (password === null) {
    throw parseErr('"password" must be not null');
  }
  if (password && [...password].length < PASS_MIN) {
    throw parseErr(`"password" must be at least ${PASS_MIN} characteres`);
  }
  if (password && [...password].length > PASS_MAX) {
    throw parseErr(`"password" must be up to ${PASS_MAX} characteres`);
  }

  return { name, email, password };
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../../schema.ts");

  describe("Parsing", () => {
    const valids = [
      {},
      { name: "name" },
      { email: "email@email.com" },
      { password: "password" },
      { name: "name", email: "email@email.com", password: "password" },
      { name: "A".repeat(NAME_MAX) },
      { name: "🅰".repeat(NAME_MAX) },
      { email: `${"A".repeat(EMAIL_MAX - 10)}@email.com` },
      { email: `${"🅰".repeat(EMAIL_MAX - 10)}@email.com` },
      { password: "A".repeat(PASS_MIN) },
      { password: "🅰".repeat(PASS_MAX) },
    ] as MutationUpdateMeArgs["input"][];

    const invalids = [
      { name: null },
      { email: null },
      { password: null },
      { name: "A".repeat(NAME_MAX + 1) },
      { name: "🅰".repeat(NAME_MAX + 1) },
      { email: `${"A".repeat(EMAIL_MAX - 10 + 1)}@email.com` },
      { email: `${"🅰".repeat(EMAIL_MAX - 10 + 1)}@email.com` },
      { password: "A".repeat(PASS_MIN - 1) },
      { password: "🅰".repeat(PASS_MAX + 1) },
    ] as MutationUpdateMeArgs["input"][];

    test.each(valids)("valids %#", (input) => {
      parseArgs({ input });
    });

    test.each(invalids)("invalids %#", (input) => {
      expect.assertions(1);
      try {
        parseArgs({ input });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
      }
    });
  });
}
