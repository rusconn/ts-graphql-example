import { isAuthenticated } from "../common/authorizers";
import type { MutationResolvers } from "../common/schema";
import { full } from "../common/resolvers";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    logout: LogoutResult
  }

  union LogoutResult = LogoutSuccess

  type LogoutSuccess {
    user: User!
  }
`;

export const resolver: MutationResolvers["logout"] = async (_parent, _args, context) => {
  const authed = authorizer(context.user);

  const updated = await context.prisma.user.update({
    where: { id: authed.id },
    data: { token: null },
  });

  return {
    __typename: "LogoutSuccess",
    user: full(updated),
  };
};

export const authorizer = isAuthenticated;
