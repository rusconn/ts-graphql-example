import bcrypt from "bcrypt";
import { v7 as uuidv7 } from "uuid";

import { passHashExp } from "../../../config.ts";
import type { MutationResolvers, MutationSignupArgs } from "../../../schema.ts";
import { authGuest } from "../../common/authorizers.ts";
import { numChars, parseErr } from "../../common/parsers.ts";
import { dateByUuid, forbiddenErr } from "../../common/resolvers.ts";
import { isEmail, isName } from "../common/parser.ts";

export const NAME_MIN = 5;
export const NAME_MAX = 15;
export const EMAIL_MAX = 100;
export const PASS_MIN = 8;
export const PASS_MAX = 50;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    signup(
      """
      ${NAME_MAX}文字まで、半角英数字とアンダースコアのみ、既に存在する場合はエラー
      """
      name: NonEmptyString!

      """
      ${EMAIL_MAX}文字まで、既に存在する場合はエラー
      """
      email: NonEmptyString!

      """
      ${PASS_MIN}文字以上、${PASS_MAX}文字まで
      """
      password: NonEmptyString!
    ): SignupResult
  }

  union SignupResult =
      SignupSuccess
    | InvalidInputError
    | UserNameAlreadyTakenError
    | UserEmailAlreadyTakenError

  type SignupSuccess {
    token: NonEmptyString!
  }
`;

export const resolver: MutationResolvers["signup"] = async (_parent, args, context) => {
  const authed = authGuest(context);

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

  const { name, email, password } = parsed;

  const [nameFound, emailFound] = await Promise.all([
    context.db //
      .selectFrom("User")
      .where("name", "=", name)
      .select("id")
      .executeTakeFirst(),
    context.db //
      .selectFrom("User")
      .where("email", "=", email)
      .select("id")
      .executeTakeFirst(),
  ]);

  if (nameFound) {
    return {
      __typename: "UserNameAlreadyTakenError",
      message: "specified name already taken",
    };
  }
  if (emailFound) {
    return {
      __typename: "UserEmailAlreadyTakenError",
      message: "specified email already taken",
    };
  }

  const hashed = await bcrypt.hash(password, passHashExp);
  const id = uuidv7();
  const idDate = dateByUuid(id);
  const token = uuidv7();

  await context.db
    .insertInto("User")
    .values({
      id,
      updatedAt: idDate,
      name,
      handle: name,
      email,
      password: hashed,
      token,
    })
    .returning("token")
    .executeTakeFirstOrThrow();

  return {
    __typename: "SignupSuccess",
    token,
  };
};

const parseArgs = (args: MutationSignupArgs) => {
  const { name, email, password } = args;

  if (numChars(name) < NAME_MIN) {
    return parseErr(`"name" must be at least ${NAME_MIN} characters`);
  }
  if (numChars(name) > NAME_MAX) {
    return parseErr(`"name" must be up to ${NAME_MAX} characters`);
  }
  if (!isName(name)) {
    return parseErr(`invalid "name"`);
  }
  if (numChars(email) > EMAIL_MAX) {
    return parseErr(`"email" must be up to ${EMAIL_MAX} characters`);
  }
  if (!isEmail(email)) {
    return parseErr(`invalid "email"`);
  }
  if (numChars(password) < PASS_MIN) {
    return parseErr(`"password" must be at least ${PASS_MIN} characters`);
  }
  if (numChars(password) > PASS_MAX) {
    return parseErr(`"password" must be up to ${PASS_MAX} characters`);
  }

  return { name, email, password };
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const validArgs = {
      name: "name",
      email: "email@email.com",
      password: "password",
    };

    const valids = [
      { ...validArgs },
      { ...validArgs, name: "A".repeat(NAME_MAX) },
      { ...validArgs, email: `${"A".repeat(EMAIL_MAX - 10)}@email.com` },
      { ...validArgs, password: "A".repeat(PASS_MIN) },
    ] as MutationSignupArgs[];

    const invalids = [
      { ...validArgs, name: "A".repeat(NAME_MAX + 1) },
      { ...validArgs, email: `${"A".repeat(EMAIL_MAX - 10 + 1)}@email.com` },
      { ...validArgs, password: "A".repeat(PASS_MIN - 1) },
      { ...validArgs, email: "emailemail.com" },
    ] as MutationSignupArgs[];

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
