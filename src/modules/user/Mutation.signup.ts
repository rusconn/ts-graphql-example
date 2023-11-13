import bcrypt from "bcrypt";
import { ulid } from "ulid";

import { passwordHashRoundsExponent } from "@/config.js";
import * as Prisma from "@/prisma/mod.js";
import { isGuest } from "../common/authorizers.js";
import { ParseError } from "../common/parsers.js";
import type { MutationResolvers, MutationSignupArgs } from "../common/schema.js";
import { userNodeId } from "./common/adapter.js";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    signup(input: SignupInput!): SignupResult
  }

  input SignupInput {
    "100文字まで"
    name: NonEmptyString!
    "100文字まで、既に存在する場合はエラー"
    email: EmailAddress!
    "8文字以上、50文字まで"
    password: NonEmptyString!
  }

  union SignupResult = SignupSuccess | EmailAlreadyTakenError

  type SignupSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["signup"] = async (_parent, args, context) => {
  const authed = authorizer(context.user);

  const { password, ...data } = parser(args);

  try {
    const hashed = await bcrypt.hash(password, passwordHashRoundsExponent);

    const created = await context.prisma.user.create({
      data: {
        id: authed.id,
        password: hashed,
        token: ulid(),
        ...data,
      },
      select: { id: true },
    });

    return {
      __typename: "SignupSuccess",
      id: adapter(created.id),
    };
  } catch (e) {
    // ほぼ確実に email の衝突
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

export const authorizer = isGuest;

export const parser = (args: MutationSignupArgs) => {
  const { name, email, password } = args.input;

  if ([...name].length > 100) {
    throw new ParseError("`name` must be up to 100 characteres");
  }
  if ([...email].length > 100) {
    throw new ParseError("`email` must be up to 100 characteres");
  }
  if ([...password].length < 8) {
    throw new ParseError("`password` must be at least 8 characteres");
  }
  if ([...password].length > 50) {
    throw new ParseError("`password` must be up to 50 characteres");
  }

  return { name, email, password, role: Prisma.Role.USER };
};

export const adapter = userNodeId;
