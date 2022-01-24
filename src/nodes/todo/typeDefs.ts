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
      "default: DESC"
      order: SortDirection
    ): TodoConnection

    todo(id: ID!): Todo
  }

  type Mutation {
    createTodo(userId: ID!, input: CreateTodoInput!): Todo
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
`;
