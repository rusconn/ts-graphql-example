export default /* GraphQL */ `
  extend type Query {
    node(id: ID!): Node
  }

  interface Node {
    id: ID!
  }
`;
