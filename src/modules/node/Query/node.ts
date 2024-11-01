import type { QueryResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { parseNodeId } from "../../common/parsers.ts";
import { getTodo } from "../../todo/common/resolver.ts";
import { getUser } from "../../user/common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    node(id: ID!): Node
  }
`;

export const resolver: QueryResolvers["node"] = async (_parent, args, context) => {
  authAuthenticated(context);

  const { type, id } = parseNodeId(args.id);

  const getNode = {
    Todo: getTodo,
    User: getUser,
  }[type];

  const node = await getNode(context, { id });

  return { type, ...node };
};
