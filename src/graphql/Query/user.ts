import type { QueryResolvers } from "../../schema.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { parseUserId } from "../_parsers/user/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    user(id: ID!): User
  }
`;

export const resolver: QueryResolvers["user"] = async (_parent, args, context) => {
  const id = parseUserId(args.id);

  if (id instanceof Error) {
    throw badUserInputErr(id.message, id);
  }

  const user = await context.api.user.getById(id);

  return user ?? null;
};
