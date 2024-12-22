import type { QueryResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { parseNodeId } from "../../common/parsers.ts";
import { badUserInputErr, forbiddenErr } from "../../common/resolvers.ts";
import { getTodo } from "../../todo/resolver.ts";
import { getUser } from "../../user/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    node(id: ID!): Node
  }
`;

export const resolver: QueryResolvers["node"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseNodeId(args.id);

  if (parsed instanceof Error) {
    throw badUserInputErr(`invalid node id: ${args.id}`, parsed);
  }

  const { type, id } = parsed;

  const getNode = {
    Todo: getTodo,
    User: getUser,
  }[type];

  const node = await getNode(context, { id });

  return node == null ? null : { type, ...node };
};
