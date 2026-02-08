import { Credential } from "../../domain.ts";
import type { MutationLoginPasswordChangeArgs, MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { invalidInputErrors, ParseErr } from "../_parsers/util.ts";
import { userId } from "../User/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    loginPasswordChange(
      """
      ${Credential.Password.MIN}文字以上、${Credential.Password.MAX}文字まで
      """
      oldPassword: String!

      """
      ${Credential.Password.MIN}文字以上、${Credential.Password.MAX}文字まで
      """
      newPassword: String!
    ): LoginPasswordChangeResult @semanticNonNull @complexity(value: 100)
  }

  union LoginPasswordChangeResult =
      LoginPasswordChangeSuccess
    | InvalidInputErrors
    | SamePasswordsError
    | IncorrectOldPasswordError

  type LoginPasswordChangeSuccess {
    id: ID!
  }

  type SamePasswordsError implements Error {
    message: String!
  }

  type IncorrectOldPasswordError implements Error {
    message: String!
  }
`;

export const resolver: MutationResolvers["loginPasswordChange"] = async (
  _parent,
  args,
  context,
) => {
  const ctx = authAuthenticated(context);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  const parsed = parseArgs(args);
  if (Array.isArray(parsed)) {
    return invalidInputErrors(parsed);
  }

  const credential = await ctx.repos.credential.findByDbId(ctx.user.id);
  if (!credential) {
    throw internalServerError();
  }

  const { oldPassword, newPassword } = parsed;
  if (oldPassword === newPassword) {
    return {
      __typename: "SamePasswordsError",
      message: "The two passwords must be different.",
    };
  }

  const match = await Credential.Password.match(oldPassword, credential.password);
  if (!match) {
    return {
      __typename: "IncorrectOldPasswordError",
      message: "The oldPassword is incorrect.",
    };
  }

  const changedCredential = await Credential.changePassword(credential, newPassword);
  const result = await ctx.repos.credential.update(changedCredential);
  switch (result) {
    case "Ok":
      break;
    case "NotFound":
      throw internalServerError();
    default:
      throw new Error(result satisfies never);
  }

  return {
    __typename: "LoginPasswordChangeSuccess",
    id: userId(credential.id),
  };
};

const parseArgs = (args: MutationLoginPasswordChangeArgs) => {
  const oldPassword = parseOldPassword(args);
  const newPassword = parseNewPassword(args);

  if (
    Array.isArray(oldPassword) || //
    Array.isArray(newPassword)
  ) {
    const errors: ParseErr[] = [];

    if (Array.isArray(oldPassword)) {
      errors.push(...oldPassword);
    }
    if (Array.isArray(newPassword)) {
      errors.push(...newPassword);
    }

    return errors;
  } else {
    return { oldPassword, newPassword };
  }
};

const parseOldPassword = (args: MutationLoginPasswordChangeArgs) => {
  const result = Credential.Password.parse(args.oldPassword);

  return Array.isArray(result)
    ? result.map((e) => new ParseErr("oldPassword", e)) //
    : result;
};

const parseNewPassword = (args: MutationLoginPasswordChangeArgs) => {
  const result = Credential.Password.parse(args.newPassword);

  return Array.isArray(result)
    ? result.map((e) => new ParseErr("newPassword", e)) //
    : result;
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids: MutationLoginPasswordChangeArgs[] = [
      {
        oldPassword: "password",
        newPassword: "password2",
      },
      {
        oldPassword: "A".repeat(Credential.Password.MIN),
        newPassword: "B".repeat(Credential.Password.MIN),
      },
    ];

    const invalids: [MutationLoginPasswordChangeArgs, (keyof MutationLoginPasswordChangeArgs)[]][] =
      [
        [
          {
            oldPassword: "A".repeat(Credential.Password.MIN - 1),
            newPassword: "A".repeat(Credential.Password.MAX),
          },
          ["oldPassword"],
        ],
        [
          {
            oldPassword: "A".repeat(Credential.Password.MIN),
            newPassword: "A".repeat(Credential.Password.MAX + 1),
          },
          ["newPassword"],
        ],
        [
          {
            oldPassword: "A".repeat(Credential.Password.MAX + 1),
            newPassword: "A".repeat(Credential.Password.MIN - 1),
          },
          ["oldPassword", "newPassword"],
        ],
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
