import bcrypt from "bcrypt";
import { v7 as uuidv7 } from "uuid";

import { passHashExp } from "../../../config.ts";
import { UserRole } from "../../../db/types.ts";
import type { MutationResolvers, MutationSignupArgs } from "../../../schema.ts";
import { authGuest } from "../../common/authorizers.ts";
import { numChars, parseErr } from "../../common/parsers.ts";
import { dateByUuid } from "../../common/resolvers.ts";
import { isEmail } from "../common/parser.ts";

const NAME_MAX = 100;
const EMAIL_MAX = 100;
const PASS_MIN = 8;
const PASS_MAX = 50;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    signup(input: SignupInput!): SignupResult
  }

  input SignupInput {
    "${NAME_MAX}文字まで"
    name: NonEmptyString!
    "${EMAIL_MAX}文字まで、既に存在する場合はエラー"
    email: NonEmptyString!
    "${PASS_MIN}文字以上、${PASS_MAX}文字まで"
    password: NonEmptyString!
  }

  union SignupResult = SignupSuccess | EmailAlreadyTakenError

  type SignupSuccess {
    token: NonEmptyString!
  }
`;

export const resolver: MutationResolvers["signup"] = async (_parent, args, context) => {
  authGuest(context);

  const { name, email, password } = parseArgs(args);

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
      email,
      password: hashed,
      role: UserRole.USER,
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
  const { name, email, password } = args.input;

  if (numChars(name) > NAME_MAX) {
    throw parseErr(`"name" must be up to ${NAME_MAX} characters`);
  }
  if (numChars(email) > EMAIL_MAX) {
    throw parseErr(`"email" must be up to ${EMAIL_MAX} characters`);
  }
  if (!isEmail(email)) {
    throw parseErr(`invalid "email"`);
  }
  if (numChars(password) < PASS_MIN) {
    throw parseErr(`"password" must be at least ${PASS_MIN} characters`);
  }
  if (numChars(password) > PASS_MAX) {
    throw parseErr(`"password" must be up to ${PASS_MAX} characters`);
  }

  return { name, email, password };
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../../schema.ts");

  describe("Parsing", () => {
    const validInput = { name: "name", email: "email@email.com", password: "password" };

    const valids = [
      { ...validInput },
      { ...validInput, name: "A".repeat(NAME_MAX) },
      { ...validInput, email: `${"A".repeat(EMAIL_MAX - 10)}@email.com` },
      { ...validInput, password: "A".repeat(PASS_MIN) },
    ] as MutationSignupArgs["input"][];

    const invalids = [
      { ...validInput, name: "A".repeat(NAME_MAX + 1) },
      { ...validInput, email: `${"A".repeat(EMAIL_MAX - 10 + 1)}@email.com` },
      { ...validInput, password: "A".repeat(PASS_MIN - 1) },
      { ...validInput, email: "emailemail.com" },
    ] as MutationSignupArgs["input"][];

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
