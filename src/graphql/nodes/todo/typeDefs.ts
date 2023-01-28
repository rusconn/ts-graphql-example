import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Mutation {
    createTodo(input: CreateTodoInput!): CreateTodoPayload

    "指定したフィールドのみ更新する"
    updateTodo(id: ID!, input: UpdateTodoInput!): UpdateTodoPayload
    deleteTodo(id: ID!): DeleteTodoPayload

    completeTodo(id: ID!): Todo
    uncompleteTodo(id: ID!): Todo
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

  type CreateTodoPayload {
    todo: Todo
  }

  type UpdateTodoPayload {
    todo: Todo
  }

  type DeleteTodoPayload {
    id: ID
  }
`;
