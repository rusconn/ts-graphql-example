export const typeDef = /* GraphQL */ `
  extend type Mutation {
    unfollowUser(id: ID!): UnfollowUserResult
  }

  union UnfollowUserResult = UnfollowUserSuccess | ResourceNotFoundError

  type UnfollowUserSuccess {
    id: ID!
  }
`;
