import { gql } from "graphql-tag";

import { makeOrderOptions, makeCursorConnections } from "@/graphql/utils";

export const typeDefs = gql`
  ${makeCursorConnections("User", { totalCount: "Int!" })}
  ${makeOrderOptions("User")}
  ${makeCursorConnections("Todo", { totalCount: "Int!" })}
  ${makeOrderOptions("Todo")}

  type Query {
    me: User

    users(
      "max: 30"
      first: Int
      after: String
      "max: 30"
      last: Int
      before: String
      orderBy: UserOrder! = { field: CREATED_AT, direction: DESC }
    ): UserConnection

    user(id: ID!): User
  }

  type Mutation {
    signup(input: SignupInput!): SignupPayload

    login(input: LoginInput!): LoginPayload

    logout: LogoutPayload

    "指定したフィールドのみ更新する"
    updateMe(input: UpdateMeInput!): UpdateMePayload

    "紐づくリソースは全て削除される"
    deleteMe: DeleteMePayload
  }

  type User implements Node {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    name: NonEmptyString
    email: EmailAddress
    token: NonEmptyString
    todo(id: ID!): Todo
    todos(
      "max: 50"
      first: Int
      after: String
      "max: 50"
      last: Int
      before: String
      orderBy: TodoOrder! = { field: UPDATED_AT, direction: DESC }
    ): TodoConnection
  }

  input SignupInput {
    "100文字まで"
    name: NonEmptyString!
    "100文字まで、既に存在する場合はエラー"
    email: EmailAddress!
    "8文字以上、50文字まで"
    password: NonEmptyString!
  }

  input UpdateMeInput {
    "100文字まで、null は入力エラー"
    name: NonEmptyString
    "100文字まで、既に存在する場合はエラー、null は入力エラー"
    email: EmailAddress
    "8文字以上、50文字まで、null は入力エラー"
    password: NonEmptyString
  }

  input LoginInput {
    "100文字まで"
    email: EmailAddress!
    "8文字以上、50文字まで"
    password: NonEmptyString!
  }

  union SignupPayload = SignupSucceeded | SignupFailed

  type LoginPayload {
    user: User
  }

  type LogoutPayload {
    user: User
  }

  type UpdateMePayload {
    user: User
  }

  type DeleteMePayload {
    id: ID
  }

  type SignupSucceeded {
    id: ID!
  }

  type SignupFailed {
    errors: [SignupError!]!
  }

  union SignupError = EmailAlreadyTakenError

  type EmailAlreadyTakenError implements Error {
    message: String!
  }
`;
