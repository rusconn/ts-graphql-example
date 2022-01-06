import { gql } from "apollo-server";

export const typeDefs = gql`
  type Query {
    node(id: ID!): Node
  }

  interface Node {
    id: ID!
  }
`;
