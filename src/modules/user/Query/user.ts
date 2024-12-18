import type { QueryResolvers } from "../../../schema.ts";
import { badUserInputErr } from "../../common/resolvers.ts";
import { parseUserNodeId } from "../common/parser.ts";
import { getUser } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    user(id: ID!): User
  }
`;

export const resolver: QueryResolvers["user"] = async (_parent, args, context) => {
  const parsed = parseUserNodeId(args.id);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const user = await getUser(context, { id: parsed });

  return user ?? null;
};
