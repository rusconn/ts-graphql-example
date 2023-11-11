import { isAuthenticated } from "../common/authorizers";
import { parseNodeId } from "../common/parsers";
import type { QueryResolvers, QueryNodeArgs } from "../common/schema";

export const typeDef = /* GraphQL */ `
  extend type Query {
    node(id: ID!): Node
  }
`;

export const resolver: QueryResolvers["node"] = (_parent, args, context) => {
  authorizer(context.user);

  const { type, id } = parser(args);

  return { type, id };
};

export const authorizer = isAuthenticated;

export const parser = (args: QueryNodeArgs) => {
  return parseNodeId(args.id);
};
