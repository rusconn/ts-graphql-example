export const typeDef = /* GraphQL */ `
  extend type Mutation {
    followUser(id: ID!): FollowUserResult
  }

  union FollowUserResult = FollowUserSuccess | ResourceNotFoundError

  type FollowUserSuccess {
    id: ID!
  }
`;
