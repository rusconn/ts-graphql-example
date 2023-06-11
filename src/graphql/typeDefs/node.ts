import { gql } from "graphql-tag";

export default gql`
  type Query {
    node(id: ID!): Node
  }

  interface Node {
    id: ID!
  }
`;
