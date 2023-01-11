import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Query {
    node(id: ID!): Node
  }

  interface Node {
    id: ID!
  }
`;
