import { gql } from "apollo-server";

export const typeDefs = gql`
  type Query {
    viewer: User!
    users(
      "default: 10, max: 30"
      first: Int
      after: String
      "max: 30"
      last: Int
      before: String
      orderBy: UserOrder
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
      orderBy: TodoOrder
    ): TodoConnection!
  }

  enum Role {
    ADMIN
    USER
    GUEST
  }

  input UserOrder {
    field: UserOrderField!
    direction: OrderDirection!
  }

  enum UserOrderField {
    CREATED_AT
    UPDATED_AT
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
