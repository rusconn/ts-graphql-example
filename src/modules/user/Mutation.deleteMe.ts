import { isAuthenticated } from "../common/authorizers.js";
import type { MutationResolvers } from "../common/schema.js";
import { userNodeId } from "./common/adapter.js";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    "紐づくリソースは全て削除される"
    deleteMe: DeleteMeResult
  }

  union DeleteMeResult = DeleteMeSuccess

  type DeleteMeSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["deleteMe"] = async (_parent, _args, context) => {
  const authed = authorizer(context.user);

  const deleted = await context.prisma.user.delete({
    where: { id: authed.id },
    select: { id: true },
  });

  return {
    __typename: "DeleteMeSuccess",
    id: adapter(deleted.id),
  };
};

export const authorizer = isAuthenticated;

export const adapter = userNodeId;
