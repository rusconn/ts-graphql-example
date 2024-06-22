import { authAdmin } from "../../common/authorizers.ts";
import type { QueryResolvers } from "../../common/schema.ts";
import { parseUserNodeId } from "../common/parser.ts";
import { getUser } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    user(id: ID!): User
  }
`;

export const resolver: QueryResolvers["user"] = async (_parent, args, context) => {
  authAdmin(context);

  const id = parseUserNodeId(args.id);

  return await getUser(context, { id });
};
