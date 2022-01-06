import { gql } from "apollo-server";

export const typeDefs = gql`
  type Query {
    users(option: UsersOption! = { order: DESC, first: 10 }): UsersResult!
    user(id: ID!): User
  }

  type Mutation {
    createUser(input: CreateUserInput!): User
    updateUser(id: ID!, input: UpdateUserInput!): User

    "紐づくリソースは全て削除される"
    deleteUser(id: ID!): User
  }

  type User implements Node {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    name: NonEmptyString!
    token: NonEmptyString!
    role: Role!
    todos(option: TodosOption! = { order: DESC, first: 20 }): TodosResult!
  }

  enum Role {
    ADMIN
    USER
    GUEST
  }

  type UsersResult {
    users: [User!]!
    cursor: NonEmptyString
  }

  input UsersOption {
    order: UsersOrder! = DESC
    "30まで"
    first: PositiveInt! = 10
    cursor: NonEmptyString
  }

  input CreateUserInput {
    "100文字まで"
    name: NonEmptyString!
  }

  input UpdateUserInput {
    "100文字まで"
    name: NonEmptyString!
  }

  enum UsersOrder {
    ASC
    DESC
  }
`;
