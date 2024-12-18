import type { PostResolvers } from "../../../schema.ts";
import { auth } from "../../common/authorizers.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    content: String
  }
`;

export const resolver: PostResolvers["content"] = (parent, _args, context) => {
  auth(context);

  return parent.content;
};
