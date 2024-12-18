export const typeDef = /* GraphQL */ `
  extend type Mutation {
    blockUser(id: ID!): BlockUserResult
  }

  union BlockUserResult = BlockUserSuccess | ResourceNotFoundError

  type BlockUserSuccess {
    id: ID!
  }
`;

// can't block self?
