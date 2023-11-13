import * as Prisma from "@/prisma/mod.js";
import { isAuthenticated } from "../common/authorizers.js";
import { ParseError } from "../common/parsers.js";
import { full } from "../common/resolvers.js";
import type { MutationResolvers, MutationUpdateMeArgs } from "../common/schema.js";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    "指定したフィールドのみ更新する"
    updateMe(input: UpdateMeInput!): UpdateMeResult
  }

  input UpdateMeInput {
    "100文字まで、null は入力エラー"
    name: NonEmptyString
    "100文字まで、既に存在する場合はエラー、null は入力エラー"
    email: EmailAddress
    "8文字以上、50文字まで、null は入力エラー"
    password: NonEmptyString
  }

  union UpdateMeResult = UpdateMeSuccess | EmailAlreadyTakenError

  type UpdateMeSuccess {
    user: User!
  }
`;

export const resolver: MutationResolvers["updateMe"] = async (_parent, args, context) => {
  const authed = authorizer(context.user);

  const parsed = parser(args);

  try {
    const updated = await context.prisma.user.update({
      where: { id: authed.id },
      data: parsed,
    });

    return {
      __typename: "UpdateMeSuccess",
      user: full(updated),
    };
  } catch (e) {
    if (e instanceof Prisma.NotUniqueError) {
      context.logger.error(e, "error info");

      return {
        __typename: "EmailAlreadyTakenError",
        message: "specified email already taken",
      };
    }

    throw e;
  }
};

export const authorizer = isAuthenticated;

export const parser = (args: MutationUpdateMeArgs) => {
  const { name, email, password } = args.input;

  if (name === null) {
    throw new ParseError("`name` must be not null");
  }
  if (name && [...name].length > 100) {
    throw new ParseError("`name` must be up to 100 characteres");
  }
  if (email === null) {
    throw new ParseError("`email` must be not null");
  }
  if (email && [...email].length > 100) {
    throw new ParseError("`email` must be up to 100 characteres");
  }
  if (password === null) {
    throw new ParseError("`password` must be not null");
  }
  if (password && [...password].length < 8) {
    throw new ParseError("`password` must be at least 8 characteres");
  }
  if (password && [...password].length > 50) {
    throw new ParseError("`password` must be up to 50 characteres");
  }

  return { name, email, password };
};
