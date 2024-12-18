import type { QueryResolvers } from "../../../schema.ts";
import { parsePostNodeId } from "../common/parser.ts";
import { getPost } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    post(id: ID!): Post
  }
`;

export const resolver: QueryResolvers["post"] = async (_parent, args, context) => {
  const id = parsePostNodeId(args.id);

  return await getPost(context, { id });
};
