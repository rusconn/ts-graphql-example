import type { PostResolvers } from "../../../schema.ts";
import { auth } from "../../common/authorizers.ts";
import { postNodeId } from "../common/adapter.ts";

export const typeDef = /* GraphQL */ `
  extend type Post implements Node {
    id: ID!
  }
`;

export const resolver: PostResolvers["id"] = (parent, _args, context) => {
  auth(context);

  return postNodeId(parent.id);
};
