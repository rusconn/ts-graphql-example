import { ORIGIN } from "../../../config.ts";
import type { PostResolvers } from "../../../schema.ts";
import { getUser } from "../../user/common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    url: URL
  }
`;

export const resolver: PostResolvers["url"] = async (parent, _args, context) => {
  const user = await getUser(context, { id: parent.userId });

  if (user == null) {
    return null;
  }

  return `${ORIGIN}/${user.name}/posts/${parent.id}`;
};
