import { gql } from "graphql-tag";

import { makeOrderOptions, makeCursorConnections } from "@/graphql/utils";

export const typeDefs = gql`
  ${makeCursorConnections("User", { totalCount: "Int!" })}
  ${makeOrderOptions("User")}

  type Query {
    me: User

    users(
      "default: 10, max: 30"
      first: Int
      after: String
      "max: 30"
      last: Int
      before: String
      orderBy: UserOrder
    ): UserConnection

    user(id: ID!): User
  }

  type Mutation {
    signup(input: SignupInput!): User

    "指定したフィールドのみ更新する"
    updateMe(input: UpdateMeInput!): User

    "紐づくリソースは全て削除される"
    deleteMe: User
  }

  type User implements Node {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    name: NonEmptyString!
    token: NonEmptyString
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

  input SignupInput {
    "100文字まで"
    name: NonEmptyString!
  }

  input UpdateMeInput {
    "100文字まで、null は入力エラー"
    name: NonEmptyString
  }
`;
