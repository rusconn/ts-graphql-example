import type { UserResolvers } from "../../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    isBlockingViewer: Boolean
  }
`;

export const resolver: UserResolvers["isBlockingViewer"] = async (parent, _args, context) => {
  if (context.user == null) {
    return false;
  }

  const block = await context.api.user.loadBlock({
    blockerId: parent.id,
    blockeeId: context.user.id,
  });

  return block != null;
};