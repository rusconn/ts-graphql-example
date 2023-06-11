export default /* GraphQL */ `
  type Query {
    node(id: ID!): Node
  }

  interface Node {
    id: ID!
  }
`;
