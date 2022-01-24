import { gql } from "apollo-server";

export const typeDefs = gql`
  type Query {
    users(
      "default: 10, max: 30"
      first: Int
      after: String
      "max: 30"
      last: Int
      before: String
      "default: DESC"
      order: SortDirection
    ): UserConnection!

    user(id: ID!): User
  }

  type Mutation {
    createUser(input: CreateUserInput!): User
    updateUser(id: ID!, input: UpdateUserInput!): User

    "紐づくリソースは全て削除される"
    deleteUser(id: ID!): User
  }

  type UserConnection {
    totalCount: Int!
    pageInfo: PageInfo!
    edges: [UserEdge!]!
  }

  type UserEdge {
    node: User!
    cursor: String!
  }

  type User implements Node {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    name: NonEmptyString!
    token: NonEmptyString!
    role: Role!
    todos(
      "default: 20, max: 50"
      first: Int
      after: String
      "max: 50"
      last: Int
      before: String
      "default: DESC"
      order: SortDirection
    ): TodoConnection!
  }

  enum Role {
    ADMIN
    USER
    GUEST
  }

  input CreateUserInput {
    "100文字まで"
    name: NonEmptyString!
  }

  input UpdateUserInput {
    "100文字まで"
    name: NonEmptyString!
  }
`;
