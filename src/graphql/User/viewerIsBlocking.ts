import type { UserResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    viewerIsBlocking: Boolean @semanticNonNull
  }
`;

export const resolver: UserResolvers["viewerIsBlocking"] = async (parent, _args, context) => {
  if (context.user == null) {
    return false;
  }

  const block = await context.api.block.load({
    blockerId: context.user.id,
    blockeeId: parent.id,
  });

  return block != null;
};
