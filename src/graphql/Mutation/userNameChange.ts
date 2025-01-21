import type { MutationResolvers, MutationUserNameChangeArgs } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { USER_NAME_MAX, USER_NAME_MIN, parseUserName } from "../_parsers/user/name.ts";
import { ParseErr, invalidInputErrors } from "../_parsers/util.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    userNameChange(
      """
      ${USER_NAME_MIN}文字以上、${USER_NAME_MAX}文字まで、既に存在する場合はエラー
      """
      name: String!
    ): UserNameChangeResult @semanticNonNull
  }

  union UserNameChangeResult =
      UserNameChangeSuccess
    | InvalidInputErrors
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

  if (Array.isArray(parsed)) {
    return invalidInputErrors(parsed);
  }

  const result = await context.api.user.updateById(authed.id, parsed);

  switch (result.type) {
    case "Success":
      return {
        __typename: "UserNameChangeSuccess",
        user: result.user,
      };
    case "NameAlreadyExists":
      return {
        __typename: "UserNameAlreadyTakenError",
        message: "name already taken",
      };
    case "EmailAlreadyExists":
      throw new Error("unreachable");
    case "Unknown":
      throw internalServerError(result.e);
    default:
      throw new Error(result satisfies never);
  }
};

const parseArgs = (args: MutationUserNameChangeArgs) => {
  const name = parseUserName(args.name, "name", {
    optional: false,
    nullable: false,
  });

  if (
    name instanceof ParseErr //
  ) {
    const errors = [];

    if (name instanceof ParseErr) {
      errors.push(name);
    }

    return errors;
  } else {
    return { name };
  }
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids: MutationUserNameChangeArgs[] = [
      { name: "foobar" },
      { name: "A".repeat(USER_NAME_MIN) },
      { name: "A".repeat(USER_NAME_MAX) },
    ];

    const invalids: [MutationUserNameChangeArgs, (keyof MutationUserNameChangeArgs)[]][] = [
      [{ name: "A".repeat(USER_NAME_MIN - 1) }, ["name"]],
      [{ name: "A".repeat(USER_NAME_MAX + 1) }, ["name"]],
    ];

    test.each(valids)("valids %#", (args) => {
      const parsed = parseArgs(args);
      expect(Array.isArray(parsed)).toBe(false);
    });

    test.each(invalids)("invalids %#", (args, fields) => {
      const parsed = parseArgs(args);
      expect(Array.isArray(parsed)).toBe(true);
      expect((parsed as ParseErr[]).map((e) => e.field)).toStrictEqual(fields);
    });
  });
}
