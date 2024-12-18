import type { QueryResolvers } from "../../../schema.ts";
import { parseNodeId } from "../../common/parsers.ts";
import { badUserInputErr } from "../../common/resolvers.ts";
import { getPost } from "../../post/common/resolver.ts";
import { getUser } from "../../user/common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    node(id: ID!): Node
  }
`;

export const resolver: QueryResolvers["node"] = async (_parent, args, context) => {
  const parsed = parseNodeId(args.id);

  if (parsed instanceof Error) {
    throw badUserInputErr(`invalid node id: ${args.id}`, parsed);
  }

  const { type, id } = parsed;

  const getNode = {
    Post: getPost,
    User: getUser,
  }[type];

  const node = await getNode(context, { id });

  return node == null ? null : { type, ...node };
};
