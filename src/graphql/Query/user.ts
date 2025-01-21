import type { QueryResolvers } from "../../schema.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { parseUserId } from "../_parsers/user/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    user(id: ID!): User
  }
`;

export const resolver: QueryResolvers["user"] = async (_parent, args, context) => {
  const parsed = parseUserId(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const user = await context.api.user.getById(parsed);

  return user ?? null;
};
