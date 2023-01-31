import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Mutation {
    createTodo(input: CreateTodoInput!): CreateTodoPayload

    "指定したフィールドのみ更新する"
    updateTodo(id: ID!, input: UpdateTodoInput!): UpdateTodoPayload
    deleteTodo(id: ID!): DeleteTodoPayload

    completeTodo(id: ID!): CompleteTodoPayload
    uncompleteTodo(id: ID!): UncompleteTodoPayload
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

  union CreateTodoPayload = CreateTodoSucceeded

  union UpdateTodoPayload = UpdateTodoSucceeded | UpdateTodoFailed

  union DeleteTodoPayload = DeleteTodoSucceeded | DeleteTodoFailed

  union CompleteTodoPayload = CompleteTodoSucceeded | CompleteTodoFailed

  type UncompleteTodoPayload {
    todo: Todo
  }

  type CreateTodoSucceeded {
    todo: Todo!
  }

  type UpdateTodoSucceeded {
    todo: Todo!
  }

  type DeleteTodoSucceeded {
    id: ID!
  }

  type CompleteTodoSucceeded {
    todo: Todo!
  }

  type UpdateTodoFailed {
    errors: [UpdateTodoError!]!
  }

  type DeleteTodoFailed {
    errors: [DeleteTodoError!]!
  }

  type CompleteTodoFailed {
    errors: [CompleteTodoError!]!
  }

  union UpdateTodoError = TodoNotFoundError

  union DeleteTodoError = TodoNotFoundError

  union CompleteTodoError = TodoNotFoundError

  type TodoNotFoundError implements Error {
    message: String!
  }
`;
