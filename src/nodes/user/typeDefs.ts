import { gql } from "apollo-server";

import { makeOrderOptions, makeCursorConnections } from "@/utils";

export const typeDefs = gql`
  ${makeCursorConnections("User", { totalCount: "Int!" })}
  ${makeOrderOptions("User")}

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

    "指定したフィールドのみ更新する"
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

  input CreateUserInput {
    "100文字まで"
    name: NonEmptyString!
  }

  input UpdateUserInput {
    "100文字まで、null は入力エラー"
    name: NonEmptyString
  }
`;
