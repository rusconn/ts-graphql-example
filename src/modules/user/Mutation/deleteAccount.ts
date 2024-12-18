export const typeDef = /* GraphQL */ `
  extend type Mutation {
    "紐づくリソースは全て削除される"
    deleteAccount: DeleteAccountResult
  }

  union DeleteAccountResult = DeleteAccountSuccess

  type DeleteAccountSuccess {
    id: ID!
  }
`;

export const resolver = () => null;
