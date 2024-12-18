export const typeDef = /* GraphQL */ `
  extend type Mutation {
    deletePost(id: ID!): DeletePostResult
  }

  union DeletePostResult = DeletePostSuccess | ResourceNotFoundError

  type DeletePostSuccess {
    id: ID!
  }
`;

export const resolver = () => null;
