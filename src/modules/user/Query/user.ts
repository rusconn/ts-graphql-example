import type { QueryResolvers } from "../../../schema.ts";
import { authAdmin } from "../../common/authorizers.ts";
import { badUserInputErr, forbiddenErr } from "../../common/resolvers.ts";
import { parseUserNodeId } from "../parsers.ts";
import { getUser } from "../resolvers.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    user(id: ID!): User
  }
`;

export const resolver: QueryResolvers["user"] = async (_parent, args, context) => {
  const authed = authAdmin(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseUserNodeId(args.id);

  if (parsed instanceof Error) {
    throw badUserInputErr(`invalid node id: ${args.id}`, parsed);
  }

  const user = await getUser(context, { id: parsed });

  return user ?? null;
};
