import { gql } from "apollo-server";

export const typeDefs = gql`
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
  }

  type TodoConnection {
    totalCount: Int!
    pageInfo: PageInfo!
    edges: [TodoEdge!]!
  }

  type TodoEdge {
    node: Todo!
    cursor: String!
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

  input TodoOrder {
    field: TodoOrderField!
    direction: OrderDirection!
  }

  enum TodoOrderField {
    CREATED_AT
    UPDATED_AT
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
