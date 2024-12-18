import type { PostResolvers } from "../../../schema.ts";
import { getUser } from "../../user/common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    user: User
  }
`;

export const resolver: PostResolvers["user"] = async (parent, _args, context) => {
  const user = await getUser(context, { id: parent.userId });

  return user ?? null;
};
