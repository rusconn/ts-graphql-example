import { gql } from "graphql-tag";

export const typeDefs = gql`
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

  union CreateTodoResult = CreateTodoSucceeded

  union UpdateTodoResult = UpdateTodoSucceeded | UpdateTodoFailed

  union DeleteTodoResult = DeleteTodoSucceeded | DeleteTodoFailed

  union CompleteTodoResult = CompleteTodoSucceeded | CompleteTodoFailed

  union UncompleteTodoResult = UncompleteTodoSucceeded | UncompleteTodoFailed

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

  type UncompleteTodoSucceeded {
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

  type UncompleteTodoFailed {
    errors: [UncompleteTodoError!]!
  }

  union UpdateTodoError = TodoNotFoundError

  union DeleteTodoError = TodoNotFoundError

  union CompleteTodoError = TodoNotFoundError

  union UncompleteTodoError = TodoNotFoundError

  type TodoNotFoundError implements Error {
    message: String!
  }
`;
