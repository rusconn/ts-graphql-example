import { gql } from "graphql-tag";

import { makeOrderOptions, makeCursorConnections } from "@/graphql/utils";

export const typeDefs = gql`
  ${makeCursorConnections("Todo", { totalCount: "Int!" })}
  ${makeOrderOptions("Todo")}

  type Query {
    todos(
      userId: ID!
      "default: 20, max: 50"
      first: Int
      after: String
      "max: 50"
      last: Int
      before: String
      orderBy: TodoOrder
    ): TodoConnection

    todo(id: ID!): Todo
  }

  type Mutation {
    createTodo(userId: ID!, input: CreateTodoInput!): Todo

    "指定したフィールドのみ更新する"
    updateTodo(id: ID!, input: UpdateTodoInput!): Todo
    deleteTodo(id: ID!): Todo

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

  input CreateTodoInput {
    "100文字まで"
    title: NonEmptyString!
    "5000文字まで"
    description: String!
  }

  input UpdateTodoInput {
    "100文字まで、null は入力エラー"
    title: NonEmptyString
    "5000文字まで、null は入力エラー"
    description: String
    "null は入力エラー"
    status: TodoStatus
  }
`;
