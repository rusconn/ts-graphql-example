import { gql } from "apollo-server";

export const typeDefs = gql`
  type Query {
    todos(userId: ID!, option: TodosOption! = { order: DESC, first: 20 }): TodosResult
    todo(id: ID!): Todo
  }

  type Mutation {
    createTodo(userId: ID!, input: CreateTodoInput!): Todo
    updateTodo(id: ID!, input: UpdateTodoInput!): Todo
    deleteTodo(id: ID!): Todo
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

  type TodosResult {
    todos: [Todo!]!
    cursor: NonEmptyString
  }

  input TodosOption {
    order: TodosOrder! = DESC
    "50まで"
    first: PositiveInt! = 20
    cursor: NonEmptyString
  }

  input CreateTodoInput {
    "100文字まで"
    title: NonEmptyString!
    "5000文字まで"
    description: String!
  }

  input UpdateTodoInput {
    "100文字まで"
    title: NonEmptyString!
    "5000文字まで"
    description: String!
    status: TodoStatus!
  }

  enum TodosOrder {
    ASC
    DESC
  }
`;
