export const typeDef = /* GraphQL */ `
  extend type Mutation {
    likePost(id: ID!): LikePostResult
  }

  union LikePostResult = LikePostSuccess | ResourceNotFoundError

  type LikePostSuccess {
    id: ID!
  }
`;
