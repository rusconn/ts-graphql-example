export const typeDef = /* GraphQL */ `
  extend type Mutation {
    unblockUser(id: ID!): UnblockUserResult
  }

  union UnblockUserResult = UnblockUserSuccess | ResourceNotFoundError

  type UnblockUserSuccess {
    id: ID!
  }
`;

// can't unblock self?
