export const typeDef = /* GraphQL */ `
  extend type Mutation {
    unlikePost(id: ID!): UnlikePostResult
  }

  union UnlikePostResult = UnlikePostSuccess | ResourceNotFoundError

  type UnlikePostSuccess {
    id: ID!
  }
`;

export const resolver = () => null;
