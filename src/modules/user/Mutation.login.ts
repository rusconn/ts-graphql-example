import bcrypt from "bcrypt";
import { ulid } from "ulid";

import * as Prisma from "@/prisma";
import { allow } from "../common/authorizers";
import { ParseError } from "../common/parsers";
import type { MutationResolvers, MutationLoginArgs } from "../common/schema";
import { full } from "../common/resolvers";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    login(input: LoginInput!): LoginResult
  }

  input LoginInput {
    "100文字まで"
    email: EmailAddress!
    "8文字以上、50文字まで"
    password: NonEmptyString!
  }

  union LoginResult = LoginSuccess | UserNotFoundError

  type LoginSuccess {
    user: User!
  }

  type UserNotFoundError implements Error {
    message: String!
  }
`;

export const resolver: MutationResolvers["login"] = async (_parent, args, context) => {
  authorizer(context.user);

  const parsed = parser(args);

  try {
    const found = await context.prisma.user.findUniqueOrThrow({
      where: { email: parsed.email },
      select: { password: true },
    });

    if (!bcrypt.compareSync(parsed.password, found.password)) {
      throw new Prisma.NotExistsError();
    }

    const updated = await context.prisma.user.update({
      where: { email: parsed.email },
      data: { token: ulid() },
    });

    return {
      __typename: "LoginSuccess",
      user: full(updated),
    };
  } catch (e) {
    if (e instanceof Prisma.NotExistsError) {
      context.logger.error(e, "error info");

      return {
        __typename: "UserNotFoundError",
        message: "user not found",
      };
    }

    throw e;
  }
};

export const authorizer = allow;

export const parser = (args: MutationLoginArgs) => {
  const { email, password } = args.input;

  if ([...email].length > 100) {
    throw new ParseError("`email` must be up to 100 characteres");
  }
  if ([...password].length < 8) {
    throw new ParseError("`password` must be at least 8 characteres");
  }
  if ([...password].length > 50) {
    throw new ParseError("`password` must be up to 50 characteres");
  }

  return { email, password };
};
