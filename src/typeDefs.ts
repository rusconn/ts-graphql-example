import * as node from "./modules/node";
import * as scalar from "./modules/scalar";
import * as todo from "./modules/todo";
import * as user from "./modules/user";

const typeDef = /* GraphQL */ `
  type Query
  type Mutation

  enum OrderDirection {
    ASC
    DESC
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  interface Error {
    message: String!
  }

  enum ErrorCode {
    BAD_USER_INPUT
    AUTHENTICATION_ERROR
    FORBIDDEN
    NOT_FOUND
    INTERNAL_SERVER_ERROR
  }
`;

export const typeDefs = [typeDef, node.typeDefs, scalar.typeDefs, todo.typeDefs, user.typeDefs];
