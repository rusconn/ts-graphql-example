import { gql } from "graphql-tag";

import { makeOrderOptions, makeCursorConnections } from "@/graphql/utils";

export const typeDefs = gql`
  ${makeCursorConnections("Todo", { totalCount: "Int!" })}
  ${makeOrderOptions("Todo")}

  type Query {
    myTodos(
      "default: 20, max: 50"
      first: Int
      after: String
      "max: 50"
      last: Int
      before: String
      orderBy: TodoOrder
    ): TodoConnection

    myTodo(id: ID!): Todo
  }

  type Mutation {
    createMyTodo(input: CreateMyTodoInput!): Todo

    "指定したフィールドのみ更新する"
    updateMyTodo(id: ID!, input: UpdateMyTodoInput!): Todo
    deleteMyTodo(id: ID!): Todo

    completeTodo(id: ID!): Todo
    uncompleteTodo(id: ID!): Todo
  }

  type Todo implements Node {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    title: NonEmptyString!
    description: String!
    status: TodoStatus!
    user: User!
  }

  enum TodoStatus {
    DONE
    PENDING
  }

  input CreateMyTodoInput {
    "100文字まで"
    title: NonEmptyString!
    "5000文字まで"
    description: String!
  }

  input UpdateMyTodoInput {
    "100文字まで、null は入力エラー"
    title: NonEmptyString
    "5000文字まで、null は入力エラー"
    description: String
    "null は入力エラー"
    status: TodoStatus
  }
`;
