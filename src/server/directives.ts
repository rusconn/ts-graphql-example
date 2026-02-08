export const typeDefs = /* GraphQL */ `
  directive @complexity(value: Int!, multipliers: [String!]) on FIELD_DEFINITION

  directive @semanticNonNull(levels: [Int] = [0]) on FIELD_DEFINITION
`;
