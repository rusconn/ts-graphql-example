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
    signup(input: SignupInput!): SignupResult

    login(input: LoginInput!): LoginResult

    logout: LogoutResult

    "指定したフィールドのみ更新する"
    updateMe(input: UpdateMeInput!): UpdateMeResult

    "紐づくリソースは全て削除される"
    deleteMe: DeleteMeResult
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

  input LoginInput {
    "100文字まで"
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

  union SignupResult = SignupSuccess | EmailAlreadyTakenError

  union LoginResult = LoginSuccess | UserNotFoundError

  union LogoutResult = LogoutSuccess

  union UpdateMeResult = UpdateMeSuccess | EmailAlreadyTakenError

  union DeleteMeResult = DeleteMeSuccess

  type SignupSuccess {
    id: ID!
  }

  type LoginSuccess {
    user: User!
  }

  type LogoutSuccess {
    user: User!
  }

  type UpdateMeSuccess {
    user: User!
  }

  type DeleteMeSuccess {
    id: ID!
  }

  type EmailAlreadyTakenError implements Error {
    message: String!
  }

  type UserNotFoundError implements Error {
    message: String!
  }
`;
