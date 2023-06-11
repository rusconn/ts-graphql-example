import { gql } from "graphql-tag";

import { makeOrderOptions, makeCursorConnections } from "@/graphql/utils";

export default gql`
  ${makeCursorConnections("Todo", { totalCount: "Int!" })}
  ${makeOrderOptions("Todo")}

  type Mutation {
    createTodo(input: CreateTodoInput!): CreateTodoResult

    "指定したフィールドのみ更新する"
    updateTodo(id: ID!, input: UpdateTodoInput!): UpdateTodoResult
    deleteTodo(id: ID!): DeleteTodoResult

    completeTodo(id: ID!): CompleteTodoResult
    uncompleteTodo(id: ID!): UncompleteTodoResult
  }

  type Todo implements Node {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    title: NonEmptyString
    description: String
    status: TodoStatus
    user: User
  }

  type User {
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

  union CreateTodoResult = CreateTodoSuccess

  union UpdateTodoResult = UpdateTodoSuccess | TodoNotFoundError

  union DeleteTodoResult = DeleteTodoSuccess | TodoNotFoundError

  union CompleteTodoResult = CompleteTodoSuccess | TodoNotFoundError

  union UncompleteTodoResult = UncompleteTodoSuccess | TodoNotFoundError

  type CreateTodoSuccess {
    todo: Todo!
  }

  type UpdateTodoSuccess {
    todo: Todo!
  }

  type DeleteTodoSuccess {
    id: ID!
  }

  type CompleteTodoSuccess {
    todo: Todo!
  }

  type UncompleteTodoSuccess {
    todo: Todo!
  }

  type TodoNotFoundError implements Error {
    message: String!
  }
`;
