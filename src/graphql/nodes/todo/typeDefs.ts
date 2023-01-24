import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Query {
    myTodo(id: ID!): Todo
  }

  type Mutation {
    createMyTodo(input: CreateMyTodoInput!): Todo

    "指定したフィールドのみ更新する"
    updateMyTodo(id: ID!, input: UpdateMyTodoInput!): Todo
    deleteMyTodo(id: ID!): ID

    completeMyTodo(id: ID!): Todo
    uncompleteMyTodo(id: ID!): Todo
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
